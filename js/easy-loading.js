/*!
 * @author      YeYe
 * @date        2017.11.9
 * @version     0.1.0
 * @requires
 * jQuery1.6+(http://jquery.com)
 * A float loader with animation, jQuery is required cause the DOM operation is based on it.
 */

var EasyLoading = (function(){

    var that = {};

    that.isInit = false;

    that.TIMEOUT = {
        FAST: 3000,
        MEDIUM: 5000,
        SLOW: 10000,
        INFINITY: null
    }

    that.TYPE = {
        BALL_PULSE: {name:"ball-pulse", alignCenter:true, offsetY:50, num:3, textOffsetY:40},
        BALL_CLIP_ROTATE: {name:"ball-clip-rotate", alignCenter:true, offsetY:50, num:1, textOffsetY:30},
        BALL_CLIP_ROTATE_PULSE: {name:"ball-clip-rotate-pulse", offsetX:15, offsetY:50, num:2, textOffsetY:40},
        SQURE_SPIN: {name:"square-spin", offsetX:25, offsetY:50, num:1, textOffsetY:40},
        BALL_CLIP_ROTATE_MULTIPLE: {name:"ball-clip-rotate-multiple", offsetX:18, offsetY:50, num:2, textOffsetY:50},
        BALL_PULSE_RISE: {name:"ball-pulse-rise", alignCenter:true, offsetY:50, num:5, textOffsetY:50},
        BALL_ROTATE: {name:"ball-rotate", offsetX:5, offsetY:50, num:1, textOffsetY:50},
        CUBE_TRANSITION: {name:"cube-transition", offsetX:5, offsetY:60, num:2, textOffsetY:70},
        BALL_ZIP_ZAG: {name:"ball-zig-zag", offsetX:35, offsetY:80, num:2, textOffsetY:80},
        BALL_ZIP_ZAG_DEFLECT: {name:"ball-zig-zag-deflect", offsetX:35, offsetY:80, num:2, textOffsetY:80},
        BALL_TRIANGLE_PATH: {name:"ball-triangle-path", offsetX:5, offsetY:60, num:3, textOffsetY:60},
        BALL_SCALE: {name:"ball-scale", alignCenter:true, offsetY:80, num:1, textOffsetY:10},
        LINE_SCALE: {name:"line-scale", alignCenter:true, offsetY:60, num:5, textOffsetY:10},
        LINE_SCALE_PARTY: {name:"line-scale-party", alignCenter:true, offsetY:60, num:4, textOffsetY:10},
        BALL_SCALE_MULTIPLE: {name:"ball-scale-multiple", offsetX:30, offsetY:60, num:3, textOffsetY:40},
        BALL_PULSE_SYNC: {name:"ball-pulse-sync", alignCenter:true, offsetY:60, num:3, textOffsetY:10},
        BALL_BEAT: {name:"ball-beat", alignCenter:true, offsetY:60, num:3, textOffsetY:10},
        LINE_SCALE_PULSE_OUT: {name:"line-scale-pulse-out", alignCenter:true, offsetY:50, num:5, textOffsetY:10},
        LINE_SCALE_PULSE_OUT_RAPID: {name:"line-scale-pulse-out-rapid", alignCenter:true, offsetY:50, num:5, textOffsetY:10},
        BALL_SCALE_RIPPLE: {name:"ball-scale-ripple", offsetX:25, offsetY:50, num:1, textOffsetY:10},
        BALL_SCALE_RIPPLE_MULTIPLE: {name:"ball-scale-ripple-multiple", offsetX:25, offsetY:20, num:3, textOffsetY:50},
        BALL_SPIN_FADE_LOADER: {name:"ball-spin-fade-loader", offsetX:10, offsetY:30, num:8, textOffsetY:50},
        LINK_SPIN_FADE_LOADER: {name:"line-spin-fade-loader", offsetX:4, offsetY:30, num:8, textOffsetY:50},
        TRIANGLE_SKEW_SPIN: {name:"triangle-skew-spin", offsetX:20, offsetY:30, num:1, textOffsetY:10},
        PACMAN: {name:"pacman", offsetX:50, offsetY:60, num:5, textOffsetY:10},
        SEMI_CIRCLE_SPIN: {name:"semi-circle-spin", offsetX:20, offsetY:40, num:1, textOffsetY:20}
    };

    /**
     * Show loader with parameters
     * @param _options
     */
    that.show = function(_options){
        var options = $.extend({}, defaults, _options);
        if(that.isInit){
            initStyle(options);
            $('#easy-loading-main').show();
        }
        else{
            var main = $("<div id='easy-loading-main' class='easy-loading-main'></div>");
            var bkg = $("<div class='easy-loading-bkg'></div>");
            var div = $("<div id='easy-loading-div' class='easy-loading-div'></div>");
            var content = $("<div id='easy-loading-content'><div></div></div>");
            var text = $("<div id='easy-loading-text' class='easy-loading-text'></div>");
            var button = $("<button id='easy-loading-button' class='easy-loading-button'></button>")
            main.append(bkg).append(div.append(content).append(text).append(button));
            $("body").append(main);
            initStyle(options);
            that.isInit = true;
        }
        // set the timer for expire
        setTimer(options);
    }

    /**
     * Inner function for style configuration
     * @param options
     */
    var initStyle = function(options){
        var content = $("#easy-loading-content");
        var main = $("#easy-loading-main");
        // 配置显示的文本
        $("#easy-loading-text").empty().append(options.text).css("padding-top", options.type.textOffsetY);
        // 配置按钮
        if(options.button!=null) {
            $("#easy-loading-button").empty().append(options.button)
                .unbind().click(function(e){
                    that.hide();
                    if(options.callback!=null)
                        options.callback('on_btn_click', e);
                })
                .show();
        }
        else
            $("#easy-loading-button").hide();
        // 设置class并清空div标签
        content.find('div').removeClass().addClass(options.type.name).empty();
        // 添加用于显示的div标签
        for(var i=0;i<options.type.num;++i){
            content.find("div").append($("<div></div>"));
        }
        content.css("margin-top", main.height()/2-options.type.offsetY);
        if(options.type.alignCenter||false) {
            console.log("Align Center");
            content.css("margin-left", 0);
            //content.find("div").css("margin-left", main.width() / 2 - options.type.offsetX);
        }
        else {
            content.css("margin-left", main.width() / 2 - options.type.offsetX);
        }
    }

    that.hide = function(){
        $('#easy-loading-main').hide();
        if(typeof(that.timer)!='undefined' && that.timer!=null)
            clearTimeout(that.timer);
    }

    that.isRunning = function(){
        return $("#easy-loading-main").is(":hidden");
    }

    /**
     * 配置定时器
     * @param options
     */
    var setTimer = function(options){
        if(options.timeout>0 && options.timeout!=null){
            that.timer = setTimeout(function () {
                if(options.callback!=null)
                    options.callback('on_loaded', options);
                $('#easy-loading-main').hide();
                that.timer = null;
            }, options.timeout);
        }
    }

    var defaults = {
        type: that.TYPE.SEMI_CIRCLE_SPIN,
        timeout: null,
        callback: null,
        text: "",
        button: null
    }

    return that;

})();
