/**
 *
 * Helper Functions with no side effects
 *
 */

/**
 * Similar to what you find in Java"s format.
 * Usage: chatsrc = "http://twitch.tv/chat/embed?channel={channel}&amp;popout_chat=true".format({ channel: streamer});
 */
if (!String.prototype.format) {
    String.prototype.format = function() {
        var str = this.toString();
        if (!arguments.length)
            return str;
        var args = typeof arguments[0],
            args = (("string" == args || "number" == args) ? arguments : arguments[0]);
        for (arg in args)
            str = str.replace(RegExp('\\{' + arg + '\\}', 'gi'), args[arg]);
        return str;
    }
}

/**
 * Parses the URL for querystring params.
 * Example usage:
 * url = "http://dummy.com/?technology=jquery&blog=jquerybyexample".
 * var tech = getQueryStringParams("technology"); //outputs: "jquery"
 * var blog = getQueryStringParams("blog");       //outputs: "jquerybyexample"
 *
 * @param sParam
 * @returns {*}
 */
function getQueryStringParams(sParam) {
    var sPageURL      = window.location.href;
    var sURLVariables = sPageURL.split("/");
    var querystring = null;
    var key;
    var value;

    for (var i = 0; i < sURLVariables.length; i++) {
        if (sURLVariables[i].substring(0, 1) == "?") { // Found query string.
            querystring = sURLVariables[i].substring(1).split("&");
        }
    }

    if (querystring) {
        for (i = 0; i < querystring.length; i++) {
            var arr = querystring[i].split("=");
            key = arr[0];
            value = arr[1];
            if (key == sParam) { // key mataches param.
                return value;    // Return match.
            }
        }
    }

    return null;
}

/**
 *
 * AngularJS Code
 *
 *
 */

var app = angular.module("App", ['hmTouchEvents']);

app.controller("Ctrl", function($scope, $http, $q, $location) {
    /**
     * Variables
     */
    // Manga vars
    $scope.mangas = [];
    $scope.chapters = [];
    $scope.chapters_pages = [];
    $scope.pages = []; // [{page: 'Page 1', url: 'http://hostname/manga/manga_name/volume/chapter/001.jpg'}]
    $scope.selectedManga;
    $scope.selectedChapter;
    $scope.selectedPage;
    $scope.src = "";
    $scope.m = 0;
    $scope.c = 0;
    $scope.p = 0;

    $scope.appName = 'manga-front';
    $scope.manga_name = ''; // Manga name.
    $scope.chapter_title = '';
    $scope.page = $scope.p + 1; // Human-readable.

    // Setup URL vars
    var port = ':' + $location.port();
    if ($location.port() == 80) port = '';
    $scope.hostname = $location.protocol() + '://' + $location.host() + port + '/'; // http://localhost:4000, http://beastmachine/, http://www.tak.com/
    $scope.absoluteUrl = $location.absUrl();

    $scope.manga_index_url = $scope.hostname + 'manga_index/index.json';
    $scope.url;
    $scope.href = "";

    // Config Vars
    $scope.opts = {'preload': true};

    // Debug
    //console.log($scope.hostname);
    //console.log(getQueryStringParams('m'));
    //console.log(getQueryStringParams('c'));
    //console.log(getQueryStringParams('p'));
    //console.log($scope.absoluteUrl);

    /**
     * Functions
     */

    /**
     * Set Image.
     * @param url
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

            // Set querystring vars
            $scope.p = i;
            $scope.page = $scope.p + 1;
            $scope.setMangaQueryParams($scope.manga_name, $scope.m, $scope.c, $scope.p);

        } else { // Next Chapter
            if ((j + 1) < j_len) {
                j++;
                $scope.selectedChapter = $scope.chapters[j]; // Change chapter.
                $scope.changeChapterPages(j, $scope.opts); // Set pages to current chapter.

                // Set querystring vars
                // Chapter is already changed.
                $scope.p = 0; // First page.
                $scope.page = $scope.p + 1;
                $scope.setMangaQueryParams($scope.manga_name, $scope.m, $scope.c, $scope.p);
            } else {
                // Show end of manga alert.
                alert('This is the last chapter of ' + $scope.manga_name + '!');
            }
        }

        // Debug
        //console.log('current: ');
        //console.log('chapter: ' + $scope.selectedChapter.index);
        //console.log('page: ' + $scope.selectedPage.index + '\n\n');
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

            // Set querystring vars
            $scope.p = i;
            $scope.page = $scope.p + 1;
            $scope.setMangaQueryParams($scope.manga_name, $scope.m, $scope.c, $scope.p);

        } else { // Prev chapter.
            if ( !((j - 1) < 0) ) {
                j--;
                $scope.selectedChapter = $scope.chapters[j]; // Change chapter.
                $scope.changeChapterPages(j, $scope.opts); // Set pages to current chapter.
                i = $scope.pages.length - 1; // Last page of chapter.
                $scope.selectedPage = $scope.pages[i]; // Set to last page.

                // Set querystring vars
                // Chapter is already changed.
                $scope.p = i;
                $scope.page = $scope.p + 1;
                $scope.setMangaQueryParams($scope.manga_name, $scope.m, $scope.c, $scope.p);
            } else {
                // Show beginning of manga alert.
                alert('This is the first page of ' + $scope.manga_name + '!');
            }

        }



        // Debug
        //console.log('current: ');
        //console.log('chapter: ' + $scope.selectedChapter.index);
        //console.log('page: ' + $scope.selectedPage.index + '\n\n');
    };

    /**
     * Capture key events and call other functions.
     */
    $scope.key = function($event) {
        if ($event.keyCode == 39) //RIGHT arrow
            $scope.next();
        else if ($event.keyCode == 37) // LEFT arrow.
            $scope.prev();
        //else if ($even.keyCode == 38) // UP arrow.
        //else if ($event.keyCode == 40) //DOWN arrow.

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
    $scope.changeChapterPages = function(index, opts) { // index corresponds to chapter: 0, 1, 2, 3...
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

        // Set querystring vars
        $scope.c = index;
        $scope.p = 0;
        $scope.setMangaQueryParams($scope.manga_name, $scope.m, $scope.c, $scope.p);

        // Set chapter title of header title
        if ($scope.selectedChapter) {
            $scope.chapter_title = $scope.selectedChapter.title;
            $scope.page = $scope.p + 1;
        }


        // Debug
        //console.log($scope.selectedChapter);
        //console.log($scope.chapters_pages);
        //console.log($scope.url);
        //console.log($scope.selectedPage.url);

        function cache(page_url, callback) {
            var preloadImage = new Image();
            preloadImage.src = page_url;
            preloadImage.onload;
            callback(true);
        }
    };

    $scope.changePage = function(url, page) {
        //Debug
        //console.log($scope.selectedPage);

        $scope.setImgSrc(url);
        $scope.p = page;
        $scope.page = page + 1;
        $scope.setMangaQueryParams($scope.manga_name, $scope.m, $scope.c, $scope.p);
    };

    /**
     * Procedural script to load mangas from index.json.
     */
    $scope.loadMangaListScript = function(index_url) {
        $scope.manga_index_url = index_url;
        var m = 0;
        if (getQueryStringParams('m')) m = getQueryStringParams('m');

        t(function(mangas) {
            angular.forEach(mangas, function(manga) {
                // STUB Give title a fancier title.
                $scope.mangas.push({
                    title: manga['title'], index: manga['index'],
                    path: $scope.hostname + manga['path']
                })
            });

            // Set default selected Manga
            $scope.selectedManga = $scope.mangas[m];
            $scope.manga_name = $scope.selectedManga.title;

            $scope.loadMangaScript($scope.selectedManga.path, m, false);

            // Debug
            //console.log($scope.mangas);
            //console.log($scope.selectedManga.path);
        });

        function t(callback) {
            $http.get(index_url).
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
    $scope.loadMangaScript = function(index_url, m, reset_chapter_to_first) {
        $scope.url = index_url;
        var c = 0;
        var p = 0;
        var reset = false;
        if (reset_chapter_to_first) reset = reset_chapter_to_first;

        if (getQueryStringParams('c')) c = getQueryStringParams('c');
        if (getQueryStringParams('p')) p = getQueryStringParams('p');
        if (reset) c = 0;

        // Debug
        console.log('m:' + m + ' c:' + c + ' p:' + p);
        console.log(reset);

        $scope.getMangaIndexQ(index_url)
        .then( function(manga_index){
            $scope.setChapterIndex(manga_index);

            // Set Manga Name and querystring vars
            $scope.manga_name = manga_index['manga_name'];
            $scope.m = m;
            $scope.c = c;
            $scope.p = p;
            $scope.setMangaQueryParams($scope.manga_name, $scope.m, $scope.c, $scope.p);

            // Set default selected chapter.
            if ($scope.chapters) {
                $scope.selectedChapter = $scope.chapters[c];
                $scope.chapter_title = $scope.selectedChapter.title;
            }

            // Change pages to selected chapter.
            $scope.changeChapterPages(c, $scope.opts);

            // Set default selected page to first.
            $scope.selectedPage = $scope.pages[p];

            // Change the src to the first page.
            $scope.setImgSrc($scope.pages[p].url);

            // Debug
            //console.log(manga_index);
            //console.log($scope.mangas);
            //console.log($scope.pages);
            //console.log($scope.chapters);
            //console.log('current: ');
            //console.log('chapter: ' + $scope.selectedChapter.index);
            //console.log('page ' + $scope.selectedPage.index + '\n');

        });
        //.then( function(manga_index) {
        //
        //})
    };

    $scope.setMangaQueryParams = function(manga_name, manga_index, chapter_index, page_index) {
        $scope.href = '#/?'
            + 'name=' + manga_name
            + '&m=' + manga_index
            + '&c=' + chapter_index
            + '&p=' + page_index;

        window.location = $scope.href;
    };

    angular.element(document).ready(function () {
        console.log('Hello World');
        // Debug
        //console.log(angular.version);
        // Load list of mangas from index.json
        $scope.loadMangaListScript($scope.manga_index_url);

        // Debug
        //console.log(getQueryStringParams('m'));
        //console.log(getQueryStringParams('c'));
        //console.log(getQueryStringParams('p'));
    });

});

