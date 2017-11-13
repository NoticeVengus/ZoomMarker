/*!
 * @author      YeYe
 * @date        2017.11.13
 * @version     0.0.5
 * @requires
 * jQuery1.6+(http://jquery.com)
 * jquery-mousewheel(https://github.com/jquery/jquery-mousewheel)
 * Hammer.js(hammerjs.github.io)
 * Happy DOUBLE ELEVEN festival :-)
 * 图片缩放工具类，您可以拖动缩放图片，并添加标记点
 */

(function($) {

    var options, that, dialog;
    var isInit = false;
    var markerList = [];     // 数组，存放marker的DOM对象
    var markerId = 0;           // marker的唯一ID，只能增加

    $.fn.extend({
        "zoomMarker": function (_options) {
            if(isInit)
                return;
            isInit = true;
            document.ondragstart=function() {return false;}
            that = $(this);
            var offset;
            // 初始化配置
            if(typeof(_options)==='undefined')
                options = defaults;
            else
                options = $.extend({}, defaults, _options);
            that.context.options = options;
            // 配置图片资源
            if(options.src===null) {
                console.log('Image resources is not defined.');
            }
            else {
                loadImage(options.src);
            }
            // 初始化鼠标滚动监听器
            that.bind('mousewheel', function(event, delta) {
                that.zoomMarker_Zoom({x:event.pageX, y:event.pageY}, delta>0?(1+options.rate):(1-options.rate));
                return false;
            });
            // 图片拖动监听器
            var picHamer = new Hammer(document.getElementById($(this).attr('id')));
            picHamer.on("pan", function (e) {
                if(!(options.pinchlock||false)){
                    dialog.hide();
                    that.zoomMarker_Move(e.deltaX+offset.left, e.deltaY+offset.top);
                }
            });
            picHamer.on("panstart", function (e) {
                offset = that.offset();
            });
            picHamer.on("panend", function (e) {
                // 解除pinch事件，使能pan
                options.pinchlock = false;
            });
            // 触屏移动事件
            picHamer.get('pinch').set({enable: true});
            picHamer.on("pinchmove", function (e) {
                dialog.hide();
                that.zoomMarker_Zoom({x:e.center.x, y:e.center.y}, e.scale/options.pinchscale);
                options.pinchscale = e.scale;
            });
            picHamer.on("pinchstart", function (e) {
                // 为了防止缩放手势结束后，两个手指抬起的速度不一致导致误判为pan事件，这里锁定pinch并在pan释放后解除
                options.pinchlock = true;
                options.pinchscale = 1.0;
            });
            // 添加用于显示marker悬浮内容窗的div标签
            dialog = $("<div id='zoom-marker-hover-dialog' class='zoom-marker-hover-dialog'></div>");
            that.parent().append(dialog);
            // 添加图像点击监听器，发送消息
            new Hammer(document.getElementById(that.attr('id'))).on('tap', function (e) {
                if(typeof(e.pointers[0].x)==='undefined'){
                    var offset = that.offset();
                    that.trigger("zoom_marker_mouse_click", {
                        x: (e.center.x-offset.left) / that.width() * options.imgNaturalSize.width,
                        y: (e.center.y-offset.top) / that.height() * options.imgNaturalSize.height
                    });
                }
                else {
                    that.trigger("zoom_marker_mouse_click", {
                        pageX: e.pointers[0].offsetX,
                        pageY: e.pointers[0].offsetY,
                        x: e.pointers[0].offsetX / that.width() * options.imgNaturalSize.width,
                        y: e.pointers[0].offsetY / that.height() * options.imgNaturalSize.height
                    });
                }
            });
        },
        // 加载图片
        "zoomMarker_LoadImage": function(src){
            loadImage(src, true);
        },
        /**
         * 图片缩放
         * @param center    缩放中心坐标，{x:1, y:2}
         * @param scale     缩放比例，>0为放大，<0为缩小
         */
        "zoomMarker_Zoom": function(center, scale){
            var that = $(this);
            var options = that.context.options;
            var offset = that.offset();
            var h0 = that.height();
            var w0 = that.width();
            var tarWidth = w0*scale;
            // 宽度限制
            if(options.max!=null && (tarWidth>options.max||tarWidth<options.min)){
                return;
            }
            that.height(h0*scale);
            that.width(tarWidth);
            if(typeof(center)==='undefined' || center===null){
                center = {};
                center.x = offset.left+w0/2;
                center.y = offset.top+h0/2;
            }
            that.offset({
                top: (center.y-that.height()*(center.y-offset.top)/h0),
                left: (center.x-that.width()*(center.x-offset.left)/w0)})
            reloadMarkers();
        },
        // 图片拖动
        // x>0向右移动，y>0向下移动
        "zoomMarker_Move": function(x, y){
            //console.log("x:"+x+",y:"+y);
            $(this).offset({top:y, left:x});
            reloadMarkers();
        },
        // 添加标记点
        // marker {src:"marker.png", x:100, y:100, size:20}
        "zoomMarker_AddMarker": function(marker){
            return addMarker(marker);
        },
        // 删除标记点
        "zoomMarker_RemoveMarker": function(markerId){
            removeMarker(markerId);
        },
        // 清空标记点
        "zoomMarker_CleanMarker": function(){
            cleanMarkers();
        },
        // 获取图像真实尺寸
        "zoomMarker_GetPicSize": function(){
            return options.imgNaturalSize;
        },
        // 图像居中显示
        "zoomMarker_ImageCenterAlign" : function(){
            imageCenterAlign();
        }
    });

    /**
     * 异步获取图片大小，需要等待图片加载完后才能判断图片实际大小
     * @param img
     * @param fn        {width:rw, height:rh}
     */
    var getImageSize = function(img, fn){
        img.onload = null;
        if(img.complete){
            fn(_getImageSize(img));
        }
        else{
            img.onload = function(){
                fn(_getImageSize(img));
            }
        }
    };

    /**
     * 获取图片大小的子方法，参考getImageSize()
     * @param img
     * @returns {{width: (Number|number), height: (Number|number)}}
     * @private
     */
    var _getImageSize = function(img){
        if (typeof img.naturalWidth === "undefined") {
            // IE 6/7/8
            var i = new Image();
            i.src = img.src;
            var rw = i.width;
            var rh = i.height;
        }
        else {
            // HTML5 browsers
            var rw = img.naturalWidth;
            var rh = img.naturalHeight;
        }
        return ({width:rw, height:rh});
    }

    /**
     * 加载图片
     * @param src
     * @param noResize  是否调整图片的位置
     */
    var loadImage = function(src, noResize){
        that.trigger("zoom_marker_img_load", src);
        that.attr("src", src);
        getImageSize(document.getElementsByName(that.attr('name'))[0], function (size) {
            if(typeof(noResize)==='undefined' || !noResize){
                // 调整图片宽高
                var originWidth = that.width();
                var originHeight = that.height();
                if (options.width != null) {
                    that.width(options.width);
                    that.height(that.width() / originWidth * originHeight);
                }
            }
            that.trigger("zoom_marker_img_loaded", size);
            if(typeof(noResize)==='undefined' || !noResize) {
                imageCenterAlign();
            }
            options.imgNaturalSize = size;
            loadMarkers(options.markers);
        });
    }

    /**
     * 图像居中
     */
    var imageCenterAlign = function(){
        // 图像居中
        var offset = that.offset();
        var pDiv = that.parent();
        var top = offset.top + (pDiv.height() - that.height()) / 2;
        var left = offset.left + (pDiv.width() - that.width()) / 2;
        that.offset({top: top > 0 ? top : 0, left: left > 0 ? left : 0});
    }

    /**
     * 加载marker
     * @param markers
     */
    var loadMarkers = function(markers){
        $(markers).each(function(index, marker){
            addMarker(marker);
        });
    };

    /**
     * 添加marker
     * @param marker
     */
    var addMarker = function(marker){
        var _marker = $("<div class='zoom-marker'><img draggable='false'><span></span></div>");
        var __marker = _marker.find("img");
        var size = marker.size||options.marker_size;
        marker.size = size;
        __marker.attr('src', marker.src);
        // 标记点内容文本
        if(typeof(marker.hint)!='undefined'){
            var span = _marker.find("span");
            span.empty().append(marker.hint.value||"");
            span.css(marker.hint.style||{});
        }
        __marker.height(size);
        __marker.width(size);
        var markerObj = {id:markerId++, marker:_marker, param:marker};
        // 按键监听器
        _marker.click(function(){
            if(typeof(marker.click)!="undefined"){
                marker.click(markerObj);
            }
            that.trigger("zoom_marker_click", markerObj);
        });
        // 悬浮监听器
        if(typeof(marker.dialog)!='undefined'){
            _marker.mousemove(function(e){
                options.hover_marker_id = markerObj.id;
                dialog.empty().append(marker.dialog.value||'').css(marker.dialog.style||{}).show().offset({
                    left: (marker.dialog.offsetX||0) + e.pageX,
                    top: (marker.dialog.offsetY||0) + e.pageY
                });
            });
            _marker.mouseout(function(e){
                options.hover_marker_id = null;
                dialog.hide();
            });
        };
        that.parent().append(_marker);
        markerList.push(markerObj);
        setMarkerOffset(_marker, marker, that.offset());
        return markerObj;
    }

    /**
     * 在拖动或缩放后重新加载图标
     */
    var reloadMarkers = function(){
        var offset = that.offset();
        $(markerList).each(function(index, element){
            setMarkerOffset(element.marker, element.param, offset);
        });
    };

    /**
     * 清空标记
     */
    var cleanMarkers = function(){
        $(markerList).each(function(index, element){
            element.marker.unbind();
            element.marker.remove();
        });
        markerList = [];
        options.markers = [];
        dialog.hide();
    };

    /**
     * 删除标记
     * @param markerId 标记点的唯一ID
     */
    var removeMarker = function(markerId){
        $(markerList).each(function(index, element){
            if(element.id===markerId) {
                element.marker.unbind();
                element.marker.remove();
                // 如果当前悬浮窗在该marker上显示，需要隐藏该悬浮窗
                if(((options.hover_marker_id||null)!=null) && options.hover_marker_id===markerId){
                    dialog.hide();
                }
                return false;
            }
        });
    }

    /**
     * 配置marker的offset
     * @param marker        需要配置的marker对象
     * @param position      marker的位置信息，包含{x: , y: }
     * @param offset        图片的offset信息
     */
    var setMarkerOffset = function(marker, position, offset){
        marker.offset({
            left: that.width() * position.x / options.imgNaturalSize.width + offset.left - position.size/2,
            top: that.height() * position.y / options.imgNaturalSize.height + offset.top - position.size
        });
    }

    var defaults = {
        rate: 0.2,              // 鼠标滚动的缩放速率
        src: null,             // 图片资源
        width: 500,           // 指定图片宽度
        min: 300,               // 图片最小宽度
        max: null,              // 图片最大宽度
        markers: [],             // marker数组，[{src:"marker.png", x:100, y:100, size:20, click:fn()}]
        marker_size: 20        // 默认marker尺寸
    }

})(window.jQuery);
