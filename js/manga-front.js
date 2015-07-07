var app = angular.module("App", ['hmTouchEvents']);

app.controller("Ctrl", function($scope, $http, $q, $location) {
    /*
     * Variables
     */
    $scope.mangas = [];
    $scope.chapters = [];
    $scope.chapters_pages = [];
    $scope.pages = []; // [{page: 'Page 1', url: 'http://hostname/manga/manga_name/volume/chapter/001.jpg'}]

    //http://localhost:4000/manga/another_world_it_exists/v01/c001/001.jpg
    $scope.hostname = $location.absUrl(); // http://localhost:4000, http://beastmachine/, http://www.tak.com/
    $scope.manga_name; // Manga name.

    $scope.manga_index_url = $scope.hostname + 'manga_index/index.json';
    $scope.url;
    $scope.selectedManga;
    $scope.selectedChapter;
    $scope.selectedPage;
    $scope.src = "";

    $scope.opts = {'preload': true}

    /**
     * Functions
     */
    $scope.setImgSrc = function(url) {
        $scope.src = $scope.hostname + url;
    };

    /**
     * Go to next manga page.
     */
    $scope.next = function() {
        var i_len = $scope.pages.length;
        var j_len = $scope.chapters.length;
        var i, j = 0;

        if ($scope.selectedPage) i = $scope.selectedPage.index;
        if ($scope.selectedChapter) j = $scope.selectedChapter.index;
        // Look ahead.
        if ((i + 1) < i_len) { // Next Page
            i++;
            $scope.selectedPage = $scope.pages[i];
            $scope.setImgSrc($scope.selectedPage.url);

        } else { // Next Chapter
            if ((j + 1) < j_len) {
                j++;
                $scope.selectedChapter = $scope.chapters[j]; // Change chapter.
                $scope.changeChapterPages(j, $scope.opts); // Set pages to current chapter.

            } else {
                // Show end of manga alert.
                alert('This is the last chapter of ' + $scope.manga_name + '!');
            }
        }

        // Debug
//            console.log('current: ');
//            console.log('chapter: ' + $scope.selectedChapter.index);
//            console.log('page: ' + $scope.selectedPage.index + '\n\n');
    };

    /**
     * Go to prev manga page.
     */
    $scope.prev = function() {
        var i, j = 0;
        if ($scope.selectedPage) i = $scope.selectedPage.index;
        if ($scope.selectedChapter) j = $scope.selectedChapter.index;

        // Look behind.
        if ( !((i - 1) < 0) ) { // Prev page.
            i--;
            $scope.selectedPage = $scope.pages[i];
            $scope.setImgSrc($scope.selectedPage.url)

        } else { // Prev chapter.
            if ( !((j - 1) < 0) ) {
                j--;
                $scope.selectedChapter = $scope.chapters[j]; // Change chapter.
                $scope.changeChapterPages(j, $scope.opts); // Set pages to current chapter.
                i = $scope.pages.length - 1; // Last page of chapter.
                $scope.selectedPage = $scope.pages[i]; // Set to last page.
            } else {
                // Show beginning of manga alert.
                alert('This is the first page of ' + $scope.manga_name + '!');
            }

        }

        // Debug
//            console.log('current: ');
//            console.log('chapter: ' + $scope.selectedChapter.index);
//            console.log('page: ' + $scope.selectedPage.index + '\n\n');
    };

    /**
     * Capture key events and call other functions.
     */
    $scope.key = function($event) {
        if ($event.keyCode == 39) //RIGHT arrow
            $scope.next();
        else if ($event.keyCode == 37) // LEFT arrow.
            $scope.prev();
//            else if ($even.keyCode == 38) // UP arrow.
//            else if ($event.keyCode == 40) //DOWN arrow.

    };

    /**
     * Get {manga_name}_index.json file via request.
     *
     * @param url, callback
     * @returns callback
     */
    $scope.getMangaIndex = function(url, callback) {
        $http.get(url).
            success(function(data) {
                callback(data)
            }).
            error(function(data) {
                callback(data);
            });
    };

    /**
     * #Q version of get {manga_name}_index.json file via request.
     *
     * @param url
     * @returns {*}
     */
    $scope.getMangaIndexQ = function(url) {
        return $q(function(resolve, reject) {
            $http.get(url).
                success(function(manga_index) {
                    resolve(manga_index)
                }).
                error(function(data) {
                    reject(data);
                });
        });
    };

    /**
     * Set chapters to selected manga.
     */
    $scope.setChapterIndex = function(manga_index) {
        // Reset Chapters.
        $scope.chapters = [];
        $scope.chapters_pages = [];

        var i = 0;
        angular.forEach(manga_index['volumes'], function(chapters, volume) { //value, key

            angular.forEach(chapters, function(chapter, chapter_number) {
                $scope.chapters.push({
                    title: volume.toUpperCase() + ' ' + chapter_number.toUpperCase() + ' - ' + chapter['title'],
                    index: i
                });
                $scope.chapters_pages.push( {
                    images: chapter['img'],
                    index: i
                });
                i++;
            });
        });

        // Set current manga_name to this manga.
        $scope.manga_name = manga_index['manga_name'];
    };

    /**
     * Change the pages to selected chapter.
     */
    $scope.changeChapterPages = function(index, opts) {
        var preload = true;
        if (opts['preload']) { preload = opts['preload'] };

        // Reset pages and set to new chapter.
        $scope.pages = [];

        // Set it.
        if ($scope.chapters_pages[index]) {
            var i = 0;

            angular.forEach($scope.chapters_pages[index]['images'], function(page_url) {

                $scope.pages.push({page: 'Page ' + (i + 1), url: page_url, index: i}); // +1 for pages.
                i++;

                if (preload) {
                    // Synchrounous
                    //var preloadImage = new Image();
                    //preloadImage.src = page_url;
                    //preloadImage.onload;
                    // Asynchrounous
                    cache(page_url, function(done) {
                        // Done
                    })
                }


            });

        }

        $scope.selectedPage = $scope.pages[0];
        $scope.setImgSrc($scope.selectedPage.url);

        function cache(page_url, callback) {
            var preloadImage = new Image();
            preloadImage.src = page_url;
            preloadImage.onload;
            callback(true);
        }
    };

    /**
     * Procedural script to load mangas from index.json.
     */
    $scope.loadMangaListScript = function(url, callback) {
        $scope.manga_index_url = url;

        t(function(mangas) {
            angular.forEach(mangas, function(manga) {
                // STUB Give title a fancier title.
                $scope.mangas.push({
                    title: manga['title'], index: manga['index'],
                    path: $scope.hostname + manga['path']
                })
            });

            // Debug
            //console.log($scope.mangas);

            // Set default selected Manga
            $scope.selectedManga = $scope.mangas[0];

            // Load default manga
            $scope.loadMangaScript($scope.selectedManga.path);
        });

        function t(callback) {
            $http.get(url).
                success(function(data) {
                    callback(data)
                }).
                error(function(data) {
                    callback(data);
                });
        }

    };

    /**
     * Procedural script to load chapters from {manga_name}_index.json.
     */
    $scope.loadMangaScript = function(url) {
        $scope.url = url;

        $scope.getMangaIndexQ(url)
        .then( function(manga_index){
            $scope.setChapterIndex(manga_index);

            // Change pages to selected chapter.
            $scope.changeChapterPages(0, $scope.opts);

            // Set default selected chapter.
            $scope.selectedChapter = $scope.chapters[0];

            // set default selected page to first.
            $scope.selectedPage = $scope.pages[0];

            // Change the src to the first page.
            $scope.setImgSrc($scope.pages[0].url);

            // Debug
            //console.log('current: ');
            //console.log('chapter: ' + $scope.selectedChapter.index);
            //console.log('page ' + $scope.selectedPage.index + '\n');

        })
//                .then( function(manga_index) {
//
//                })
    };

    angular.element(document).ready(function () {
        console.log('Hello World');
        // Debug
//            console.log(angular.version);
        // Load list of mangas from index.json
        $scope.loadMangaListScript($scope.manga_index_url);
    });

});