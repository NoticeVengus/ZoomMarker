/**
 * @author 		YeYe
 * @date        2017.10.25
 * @version		0.0.1
 * @require
 * jQuery1.6+(http://jquery.com/)
 * 图片缩放工具类
 */

(function($) {

    var options, that;
    var markerList = [];     // 数组，存放marker的DOM对象
    var mouse = {};         // 鼠标当前位置

    $.fn.extend({
        "zoomMarker": function (_options) {
            that = $(this);
            var mousePosition = {isDrag:false, x:0, y:0};
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
            $(this).bind('mousewheel', function(event, delta) {
                if(delta>0)
                    that.zoomMarker_ZoomIn();
                else
                    that.zoomMarker_ZoomOut();
                return false;
            });
            // 初始化拖动监听器
            $(this).mousedown(function(e){
                var offset = $(this).offset();
                mousePosition.x = -offset.left + e.pageX;
                mousePosition.y = -offset.top + e.pageY;
                mousePosition.isDrag = true;
            });
            $(this).mouseup(function (e) {
                mousePosition.isDrag = false;
            });
            $(this).mouseleave(function () {
                mousePosition.isDrag = false;
            });
            $(this).mousemove(function(e){
                if(mousePosition.isDrag){
                    $(this).zoomMarker_Move(e.pageX-mousePosition.x, e.pageY-mousePosition.y);
                }
                mouse.x = e.pageX;
                mouse.y = e.pageY;
            });
        },
        // 加载图片
        "zoomMarker_LoadImage": function(src){
            loadImage(src);
        },
        // 图片放大
        "zoomMarker_ZoomIn": function(){
            var that = $(this);
            var options = that.context.options;
            var offset = that.offset();
            var h0 = that.height();
            var w0 = that.width();
            that.height(h0*(1+options.rate));
            that.width(w0*(1+options.rate));
            that.offset({
                top: (mouse.y-that.height()*(mouse.y-offset.top)/h0),
                left: (mouse.x-that.width()*(mouse.x-offset.left)/w0)})
            reloadMarkers();
        },
        // 图片缩小
        "zoomMarker_ZoomOut": function(){
            var that = $(this);
            var options = that.context.options;
            var offset = that.offset();
            var h0 = that.height();
            var w0 = that.width();
            that.height(h0*(1-options.rate));
            that.width(w0*(1-options.rate));
            that.offset({
                top: (mouse.y-that.height()*(mouse.y-offset.top)/h0),
                left: (mouse.x-that.width()*(mouse.x-offset.left)/w0)})
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
        // 清空标记点
        "zoomMarker_CleanMarker": function(){
            cleanMarkers();
        }
    });

    /**
     * 异步获取图片大小，需要等待图片加载完后才能判断图片实际大小
     * @param img
     * @param fn        {width:rw, height:rh}
     */
    var getImageSize = function(img, fn){
        img.onload = function(){
            fn(_getImageSize(img));
        }
        if(img.complete){
            fn(_getImageSize(img));
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
     */
    var loadImage = function(src){
        that.attr("src", src);
        getImageSize(document.getElementsByName(that.attr('name'))[0], function(size){
            //alert(JSON.stringify(size));
            options.imgNaturalSize = size;
            loadMarkers(options.markers);
        });
    };

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
        var _marker = $("<img class='zoom-marker' draggable='false' style='position: absolute;'/>");
        var size = typeof(marker.size)==='undefined'?20:marker.size;
        marker.size = size;
        _marker.attr('src', marker.src);
        _marker.height(size);
        _marker.width(size);
        setMarkerOffset(_marker, marker, that.offset());
        // 按键监听器
        if(typeof(marker.click)!="undefined"){
            _marker.click(function(){
                marker.click(_marker);
            });
        }
        that.parent().append(_marker);
        markerList.push({marker:_marker, param:marker});
        return _marker;
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
    };

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
        rate: 0.2,              // 缩放速率
        src: null,             // 图片资源
        markers: []             // marker数组，[{src:"marker.png", x:100, y:100, size:20, click:fn()}]
    }

})(window.jQuery);
