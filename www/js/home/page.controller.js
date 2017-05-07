/**
 * Created by ZTHK10 on 2017/2/17.
 */
$('html').height($(window).height());
var app = angular.module('myApp', ['ui.router', 'ngSanitize', 'infinite-scroll', 'ngCookies', 'validation']);
/*
 *app.controller('PageCtrl',function($http,$scope){
 var imgUrls=[],imgUrlsNor=[],arr=[];
 $http.get("pages.json").then(function(response){
 $scope.pages=response.data;
 arr=$scope.pages;
 arr[0].select=true;
 angular.forEach(response.data,function(item){
 item.select=item.select? item.select : false;
 imgUrls.push(
 item.preUrl
 );
 imgUrlsNor.push(
 item.norUrl
 );
 });
 });
 $scope.imgUrl=function($index){
 if(arr[$index].select){
 angular.element(document).find('.pageName').eq($index).addClass('active');
 return imgUrls[$index];
 }else{
 return imgUrlsNor[$index]
 }
 };

 $scope.$watch("num",function(newVal,oldVal){
 if(newVal!=oldVal){
 angular.element(document).find('.pageName').eq(oldVal).removeClass('active');
 arr[oldVal].select=false;
 arr[newVal].select=true;
 }else{
 return false;
 }
 });
 $scope.activeImg=function($index){
 $scope.num=$index;
 };

 }); 
 */


app.config(function ($urlRouterProvider, $stateProvider) {
    $urlRouterProvider.otherwise("skin");
    $stateProvider
        .state("skin", {
            url: '/skin',
            templateUrl: "templates/skin.html",
            controller: 'SkinCtrl'
        })
        .state("login", {
            url: '/login',
            templateUrl: 'templates/login.html',
            controller: 'LoginCtrl'
        })
        .state('register', {
            url: '/register',
            templateUrl: 'templates/register.html',
            controller: 'RgstCtrl'
        })
        .state("home", {
            url: "/home",
            templateUrl: "templates/home.html",
            controller: "HomeCtrl"
        }).state("home.firstPage", {
            url: "/firstPage",
            templateUrl: "templates/home-firstPage.html"
        })
        .state("home.message", {
            url: "/message",
            templateUrl: "templates/home-message.html",
            controller: 'MessageCtrl'
        })
        .state("home.community", {
            url: "/community",
            templateUrl: "templates/home-community.html",
            controller: 'CommunityCtrl'
        })
        .state("home.me", {
            url: "/me",
            templateUrl: "templates/home-me.html"
        })
        .state("position", {
            url: "/position/:id",
            templateUrl: "templates/position.html",
            controller: "PositionCtrl"
        })
        .state('search', {
            url: '/search',
            templateUrl: 'templates/search.html',
            controller: 'SearchCtrl'
        })
        .state('searchResult', {
            url: "/searchResult",
            templateUrl: "templates/searchResult.html",
            controller: 'ResultCtrl'
        })
        .state('question', {
            url: '/question',
            templateUrl: 'templates/question.html',
            controller: 'QuestionCtrl'
        })
});
//login&register 页面 
app.controller('LoginCtrl', ['$scope', '$state', '$injector', 'cache', '$interval', function ($scope, $state, $injector, cache, $interval) {
    var $validationProvider = $injector.get('$validation');
    $scope.srcAcct = "img/home/login.png";
    $scope.srcAcctActive = "img/home/login-green.png";
    $scope.srcPwdNormal = "img/home/login-pwd.png";
    $scope.srcPwdActive = "img/home/login-pwd-green.png";
    $scope.btn1 = "登录";
    $scope.btn2 = "快速注册，发现职场新机会";
    $scope.input1 = "请输入已验证的手机号或邮箱";
    $scope.input2 = "请输入密码";
    $scope.word = '<span class="pull-right"><img class="xs-logo" src="img/home/icon_forget.png" alt="question"/><span>忘记密码</span></span>';
    $scope.srcWord = "img/home/icon_forget.png";
    $scope.page=function(){
        $state.go("register")
    };
    $scope.user = {
        //对form进行验证，跟button disabled进行绑定，确认button可用状态。
        checkValid: $validationProvider.checkValid,
        submit: function (form) {
            $validationProvider.validate(form).success($scope.success);
        }
    };
    //设置blur后进行验证
    $validationProvider.setValidMethod('blur');
    //如果cookie中有数据，直接给用户默认输入
    if (cache.get('user')) {
        $scope.user.account = cache.get('user').account;
        $scope.user.password = cache.get('user').password;
    }
    //控制invalid message出现1s后消失
    var invalidMsg = function () {
        var count = 2;
        var showTime = $interval(function () {
            if (count > 0) {
                $scope.invalidLogin = count;
                count--;
            } else {
                $scope.invalidLogin = null;
                $interval.cancel(showTime);

            }
        }, 500);
    };
    //当form验证成功后，验证用户名，密码和cookie中的是否匹配，不匹配报错，匹配进入主页
    $scope.success = function () {
        if (cache.get('user') && ($scope.user.account != cache.get('user').account || $scope.user.password != cache.get('user').password)) {
            invalidMsg()
        } else {
            $state.go('home.firstPage',{},{reload:true})
        }
    };
    //如果用户自己输入用户名密码，如果输入有误进入invalidCallback函数，控制message显示时间。
    $validationProvider.invalidCallback = function (ele) {
        invalidMsg()
    };
}]);
//自定义验证方法和defaultmsg
app.config(['$validationProvider', function ($validationProvider) {
    var expression = {
        phone: /^1[\d]{10}$/,
        password: function (value) {
            if (value) {
                var str = value + "";
                return str.length > 5 && str.length < 17;
            } else {
                return false;
            }
        }
    };
    var defaultMsg = {
        phone: {
            success: "",
            error: "请输入有效手机号"
        },
        password: {
            success: "",
            error: "密码长度为6-16位"
        }
    };
    $validationProvider.setExpression(expression).setDefaultMsg(defaultMsg);


}]);
app.directive('loginRegister', ['$injector', function ($injector) {
    return {
        restrict: "A",
        templateUrl: "templates/viewModel/login-register.html",
        link: function ($scope, ele) {
            /*
             设置button在无值时为disabled
             *  $scope.$watch("user", function (oldval, newval) {
             {
             if (newval && newval.acctBind && newval.pwdBind) {
             ele.find('.log-in').removeAttr('disabled');
             } else {
             ele.find('.log-in').attr('disabled', 'disabled');
             }
             }
             }, true)
             * */
            $validationProvider = $injector.get('$validation');

        }
    }
}]);
app.controller('RgstCtrl', ['$scope', '$state', '$injector', '$interval', 'cache', function ($scope, $state, $injector, $interval, cache) {
    var $validationProvider = $injector.get('$validation');
    $scope.srcAcct = "img/home/login.png";
    $scope.srcAcctActive = "img/home/login-green.png";
    $scope.srcPwdNormal = "img/home/login-pwd.png";
    $scope.srcPwdActive = "img/home/login-pwd-green.png";
    $scope.input1 = "请输入手机号或邮箱";
    $scope.input2 = "请输入验证码";
    $scope.word = '<span><img class="xs-logo" src="img/home/icon_forget.png" alt="question"/><span>注册代表你已同意</span><a class="green">拉钩用户协议</a></span>';
    $scope.btn1 = "注册";
    $scope.btn2 = "返回登录";
    $scope.srcWord = "img/home/icon_forget.png";
    $scope.page=function(){
        $state.go("login")
    };
    $scope.valCode = "获取验证码";
    $validationProvider.setValidMethod('submit-only');
    $scope.user = {
        checkValid: $validationProvider.checkValid,
        submit: function (form) {
            $validationProvider.validate(form).error($scope.error).success($scope.success);
        }
    };
    /*
     *   $scope.acctInvalid=1;
     $scope.pwdInvalid=2
     */
    $scope.error = function () {
        var count = 3;
        var showTime = $interval(function () {
            if (count > 0) {
                $scope.invalidRegister = count;
                count--
            } else {
                $scope.invalidRegister = null;
                $interval.cancel(showTime);
            }
            return $scope.invalidRegister
        }, 1000);
    };
    //注册后验证成功，即将用户名密码输入cookie
    $scope.success = function () {
        $state.go('login')
        cache.put('user', $scope.user);
    };

}]);
//首页
app.controller('SkinCtrl', ['$scope', '$interval', '$state', function ($scope, $interval, $state) {
    $scope.time = 2;
    var showTime = $interval(function () {
        if ($scope.time > 1) {
            $scope.time--;
        } else {
            $scope.time = "";
            $interval.cancel(showTime)
            $state.go('login')
        }
    }, 1000)
}]);
//言职
app.controller('CommunityCtrl', ['$scope', function ($scope, ele) {
    $scope.list = [
        {
            sref: "",
            src: "img/home/banner3.png",
            alt: "firstslide",
            words: "言职观察|高薪水和大背景的公司要怎么"
        },
        {
            sref: "",
            src: "img/home/banner4.png",
            alt: "firstslide",
            words: "言职观察|高薪水和大背景的公司要怎么"
        }
    ];
    $('.carousel').carousel({
        interval: 5000
    });

}]);
app.controller('QuestionCtrl', ['$scope', '$state', 'cache', function ($scope, $state, cache) {
    $scope.back = function () {
        cache.put('activeIndex', 2);
        $state.go('home.community');
    }
}])
app.controller('MessageCtrl', ['$scope', function ($scope) {
    $scope.list = [
        {
            url: "img/home/ads-1.png",
            alt: "简历状态",
            words: "简历状态"
        },
        {
            url: "img/home/ads-2.png",
            alt: "职位动态",
            words: "职位动态"
        },
        {
            url: "img/home/ads-3.png",
            alt: "言职通知",
            words: "言职通知"
        }]
}]);

app.service('cache', ['$cookieStore', function ($cookieStore) {
    this.put = function (key, value) {
        $cookieStore.put(key, value);
    };
    this.get = function (key) {
        return $cookieStore.get(key)
    };
    this.remove = function (key) {
        $cookieStore.remove(key);
    }
}]);
app.service('autoSearch', ["cache", function (cache) {
    this.getSearch = function (index, arr) {
        cache.put("getSearch", arr[index]);
    };

}]);
app.directive('guessSearch', ["cache", "autoSearch", function (cache, autoSearch) {
    return {
        restrict: 'A',
        replace: true,
        templateUrl: 'templates/viewModel/guessSearch.html',
        link: function ($scope) {
            $scope.list = ['运维', 'C++', '测试', 'UI', '设计', '后端', '腾讯', '爱奇艺改变“视”届'];
            $scope.getSearch = function (index, arr) {
                $scope.search = arr[index];
                console.log($scope.search);
                return autoSearch.getSearch(index, arr)
            }

        }
    }
}]);
app.controller('SearchCtrl', ["$scope", "cache",'$state', function ($scope, cache,$state) {
    var arr = [ ];
    cache.remove('search');
    cache.remove('getSearch');
    $scope.saveSearch = function () {
        cache.put('search', $scope.search);
        if ($scope.search != null) {
            arr.push($scope.search)
        }
        $.each(cache.get("history"), function (index, obj) {
            if (arr.length < 3) {
                arr.push(obj)
            }
        });
        cache.put('history', arr);
        $state.go('searchResult');
    };
    $scope.searchList = cache.get("history");
    cache.put("location", $scope.location);
    $scope.clearSearch = function () {
        cache.remove("history");
        $scope.searchList = [ ];
    };
    $scope.clearSearch=function(){
        $state.go('home.firstPage');
    }

}]);
app.controller('ResultCtrl', ["$scope", "cache",'$state', function ($scope, cache,$state) {
    $scope.placeholder = cache.get("search") || cache.get("getSearch");
    $scope.location = cache.get('location');
    $scope.filterObj = $scope.placeholder;
    $scope.goHome=function(){
        $state.go('home.firstPage');
        cache.put('activeIndex',0)
    }


}]);

app.controller('HomeCtrl', ["$http", "$scope",'$timeout','cache', function ($http, $scope,$timeout,cache) {


}]);
app.directive('header', [function () {
    return {
        restrict: "AE",
        replace: true,
        templateUrl: "templates/viewModel/header.html",
        link: function ($scope,ele) {
            $(window).scroll(function(){
               if($(window).scrollTop()>100){
                   $('.search').addClass('changeBg')
               }else{
                   $('.search').removeClass('changeBg')
               }
            })
        }
    }
}]);
app.directive('advertise', ["$http", function ($http) {
    return {
        restrict: "AE",
        replace: true,
        templateUrl: "templates/viewModel/advertise.html",
        link: function ($scope, ele, ctrl) {
            $http.get("data/banner.json").then(function (resp) {
                $scope.banner = resp.data;
                ele.carousel({})
            });
            $scope.ads = [
                {
                    imgUrl: "img/home/ads-1.png",
                    alt: "日常任务",
                    words: "日常任务"
                },
                {
                    imgUrl: "img/home/ads-2.png",
                    alt: "直播LIVE",
                    words: "直播LIVE"
                },
                {
                    imgUrl: "img/home/ads-3.png",
                    alt: "首发专场",
                    words: "首发专场"
                },
                {
                    imgUrl: "img/home/ads-1.png",
                    alt: "城市专场",
                    words: "城市专场"
                }
            ];
        }
    }
}]);

app.directive('positionIntro', ["$http", function ($http) {
    return {
        restrict: "AE",
        replace: true,
        templateUrl: "templates/viewModel/positionIntro.html",
        link: function ($scope) {
            $http.get("data/positionIntro.json").then(function (resp) {
                $scope.list = resp.data;
            });
            $scope.getList = function () {
                $('.search').addClass('bgChange')
            }

        },
        controller: function ($scope) {

        }
    }
}]);
app.directive('footer', ['$http', 'cache', function ($http, cache) {
    return {
        restrict: "AE",
        replace: true,
        templateUrl: "templates/viewModel/footer.html",
        link: function ($scope, $ele, $attr, ctrl) {
            var array = [], imgUrls = [], imgUrlsNor = [];
            $http.get('data/pages.json').then(function (resp) {
                $scope.pages = resp.data;
                array = $scope.pages;
                /*

                 var number=cache.get('activeIndex');
                 if(number){
                 array[number].select=true;
                 $scope.num = number;
                 }else{
                 array[0].select = true;
                 }
                 */

                /*以下函数需写在$http函数内部，若写在外部，array数组将为空，因为会先读取表达式，再解析内部函数*/
                /*从cookie中取得最后一次选中的图标序列号，刷新或者退回时，就可以使那个图标处于激活状态，不必每次激活的都是第一个图标*/
                var number = cache.get('activeIndex');
                if (!number) {
                    array[0].select = true;
                }
                else {
                    array[number].select = true;
                    //必须将该index存入num中，这样当监测num变化时，才会正常使上一个num处于非激活状态。
                    $scope.num=number;
                }
                angular.forEach(array, function (item, index, array) {
                    imgUrls.push(item.preUrl);
                    imgUrlsNor.push(item.norUrl);
                });
            });
            $scope.imgUrl = function (index) {
                if (array[index].select) {
                    angular.element(document).find('.pageName').eq(index).addClass('active');
                    return imgUrls[index];
                } else {
                    return imgUrlsNor[index];
                }
            };
            $scope.activeImg = function (index) {
                $scope.num = index;
                cache.put('activeIndex',index)
            };
            $scope.$watch('num', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    angular.element(document).find('.pageName').eq(oldVal).removeClass('active');
                    array[oldVal].select = false;
                    array[newVal].select = true;
                } else {
                    return false;
                }
            })
        }
    }
}]);

app.controller('PositionCtrl', [function ($scope) {

}]);

app.directive('jobInfo', function ($http, $state) {
    return {
        restrict: "A",
        templateUrl: 'templates/viewModel/companyInfo.html',
        replace: true,
        link: function ($scope, ele) {
            $http.get("data/position" + $state.params.id + ".json").then(function (resp) {
                $scope.title = "职位详情";
                $scope.position = resp.data;
                $scope.list = $scope.position.requirements;
            });

            $(window).bind("scroll", function () {
                if ($(window).scrollTop() > 100) {
                    $scope.title = $scope.position.title;
                }else{
                    $scope.title = "职位详情";
                }
                //此处调用$apply方法启动$digest循环，从而调用$watch函数监听到title值的变化，反应到视图。更多关于$apply()的应用：http://www.jb51.net/article/73359.htm
                $scope.$apply();
            });

            /*唤起高德地图*/
            ele.find('#myModal').on('show.bs.modal', function () {
                $('.modal').css({"display": "block"});
                var top = $(window).height() / 2 - ele.find('.modal-dialog').height() / 2;
                ele.find('.modal-dialog').css({
                    "marginTop": top
                });


            });

        }
    }
});
/*手机上返回按钮事件*/
app.controller('Myctrl',['$scope','$timeout',function($scope,$timeout){
    $(document).on('deviceready',function(){
        $(this).on('backbutton',function() {
            console.log("back");
            if($(".pages").length>0){
                var close=false;
                console.log('deviceready');
                if(close){
                    if(t){$timeout.cancel(t)}
                    cache.clear('activeIndex');
                    navigator.app.exitAPP();
                }else{
                    close=true;
                    $('.exit').addClass('appear');
                    var t=$timeout(function(){
                        $('.exit').removeClass('appear');
                    },1000)
                }
            }else{
                history.go(-1)
            }

        })
    })
}]);



