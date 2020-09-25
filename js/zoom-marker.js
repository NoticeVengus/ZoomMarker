/*!
 * @author      YeYe
 * @date        2020.9.25
 * @version     0.1.9
 * @requires
 * jQuery1.6+(http://jquery.com)
 * jquery-mousewheel(https://github.com/jquery/jquery-mousewheel)
 * Hammer.js(hammerjs.github.io)
 *
 * Happy National Day Of 2020 :-P
 * 图片缩放工具类，您可以拖动缩放图片，并添加标记点
 * 支持同时显示多张图片
 */

(function($) {

    const GLOBAL = [];     // 全局变量集合
    var gIndex = 0;
    const MAX_IMG_Z_INDEX = 980;    // 图像最大z-index
    const CANVAS_SUFFIX = "_canvas";    // canvas层后缀

    $.fn.extend({
        "zoomMarker": function (_options) {
            const ID = $(this).attr('id');
            initGlobalData(ID);
            const params = getGlobalParam(ID);
            var options = params.options;
            var that = params.that;
            var dialog = params.dialog;
            var isInit = params.isInit;

            if(isInit)
                return;
            isInit = true;
            params.isInit = isInit;
            document.ondragstart=function() {return false;};
            that = $(this);
            params.that = that;
            var offset;
            // 初始化配置
            if(typeof(_options)==='undefined')
                options = defaults;
            else
                options = $.extend({}, defaults, _options);
            params.options = options;
            // 配置图片资源
            if(options.src===null) {
                console.error('Image resources is not defined.');
                return;
            }
            else {
                loadImage(ID, options.src);
            }
            // 初始化鼠标滚动监听器
            that.bind('mousewheel', function(event, delta) {
                that.zoomMarker_Zoom(options.zoom_lock ? null : {x:event.pageX, y:event.pageY}, delta>0?(1+options.rate):(1-options.rate));
                return false;
            });
            // 图片拖动监听器
            const picHammer = new Hammer(document.getElementById($(this).attr('id')));
            picHammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
            picHammer.on("panleft panright panup pandown", function (e) {
                if(!(options.pinchlock||false)){
                    dialog.hide();
                    that.zoomMarker_Move(e.deltaX+offset.left, e.deltaY+offset.top);
                    // 移动图层顺序
                    if(options.auto_index_z) {
                        moveImageTop(ID);
                    }
                }
            });
            picHammer.on("panstart", function () {
                offset = that.offset();
            });
            picHammer.on("panend", function () {
                // 解除pinch事件，使能pan
                options.pinchlock = false;
            });
            // 触屏移动事件
            picHammer.get('pinch').set({enable: true});
            picHammer.on("pinchmove", function (e) {
                dialog.hide();
                that.zoomMarker_Zoom({x:e.center.x, y:e.center.y}, e.scale/options.pinchscale);
                options.pinchscale = e.scale;
            });
            picHammer.on("pinchstart", function () {
                // 为了防止缩放手势结束后，两个手指抬起的速度不一致导致误判为pan事件，这里锁定pinch并在pan释放后解除
                options.pinchlock = true;
                options.pinchscale = 1.0;
            });
            // 添加用于显示marker悬浮内容窗的div标签
            dialog = $("<div id='zoom-marker-hover-dialog' class='zoom-marker-hover-dialog'></div>");
            params.dialog = dialog;
            that.parent().append(dialog);
            // 添加图像点击监听器，发送消息
            picHammer.on('tap', function (e) {
                const params = getGlobalParam(ID);
                const options = params.options;
                const that = params.that;
                // 只有图像在顶部的时候，才响应点击事件
                if(!isLayoutOnTop(ID)) {
                    moveImageTop(ID);
                    return;
                }
                // 发送消息
                if(typeof(e.pointers[0].x) === 'undefined'){
                    const offset = that.offset();
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
                // 移动图层顺序
                if(options.auto_index_z) {
                    moveImageTop(ID);
                }
            });
        },
        // 加载图片
        "zoomMarker_LoadImage": function(src){
            const ID = $(this).attr('id');
            loadImage(ID, src, true);
        },
        /**
         * 图片缩放
         * @param center    缩放中心坐标，{x:1, y:2}
         * @param scale     缩放比例，>0为放大，<0为缩小
         */
        "zoomMarker_Zoom": function(center, scale){
            const ID = $(this).attr('id');
            const params = getGlobalParam(ID);
            const options = params.options;
            const that = params.that;

            //var that = $(this);
            //var options = document.options;
            const offset = that.offset();
            const hwRatio = options.imgNaturalSize.height / options.imgNaturalSize.width;
            const h0 = that.height();
            const w0 = that.width();
            var tarWidth = w0 * scale;
            var tarHeight = tarWidth * hwRatio;
            // 最大宽度限制
            if(null != options.max && tarWidth > options.max) {
                tarWidth = options.max;
                tarHeight = tarWidth * hwRatio;
            }
            // 最小宽度限制
            else if(null != options.min && tarWidth < options.min) {
                tarWidth = options.min;
                tarHeight = tarWidth * hwRatio;
            }

            tarWidth = parseInt(tarWidth);
            tarHeight = parseInt(tarHeight);

            if(typeof(center)==='undefined' || center===null){
                center = {};
                center.x = offset.left+w0/2;
                center.y = offset.top+h0/2;
            }
            var y = center.y-tarHeight*(center.y-offset.top)/h0;
            var x = center.x-tarWidth*(center.x-offset.left)/w0;

            var isOverlap = false;
            if(options.move_limit) {
                var param = limitLockZoom($(this), tarWidth, tarHeight, x, y, center);
                if(param.isTerminate) {
                    return;
                }
                isOverlap = param.isOverlap;
                if(isOverlap) {
                    // 越界操作
                    that.height(param.height);
                    that.width(param.width);
                    that.offset({top: param.offset.top, left: param.offset.left});
                }
            }
            // 缩放后没有越界
            if(!isOverlap) {
                that.height(tarHeight);
                that.width(tarWidth);
                that.offset({top: y, left: x});
            }
            reloadMarkers(ID);
            resizeCanvas(ID);
        },
        // 图片拖动
        // x>0向右移动，y>0向下移动
        "zoomMarker_Move": function(x, y){
            const ID = $(this).attr('id');
            const params = getGlobalParam(ID);
            const options = params.options;
            // 是否允许拖动
            if(options.enable_drag) {
                // 是否锁边
                if(options.move_limit) {
                    limitLockOffset($(this), x, y);
                } else {
                    $(this).offset({top:y, left:x});
                }
                reloadMarkers(ID);
                resizeCanvas(ID);
            }
        },
        // 添加标记点
        // marker {src:"marker.png", x:100, y:100, size:20}
        "zoomMarker_AddMarker": function(marker){
            return addMarker($(this).attr('id'), marker);
        },
        // 删除标记点
        "zoomMarker_RemoveMarker": function(markerId){
            removeMarker($(this).attr('id'), markerId);
        },
        // 清空标记点
        "zoomMarker_CleanMarker": function(){
            cleanMarkers($(this).attr('id'));
        },
        // 获取图像真实尺寸
        "zoomMarker_GetPicSize": function(){
            const ID = $(this).attr('id');
            const params = getGlobalParam(ID);
            const options = params.options;
            return options.imgNaturalSize;
        },
        // 设置是否允许拖动
        "zoomMarker_EnableDrag" : function(enable) {
            enableDrag($(this).attr('id'), enable);
        },
        // 置顶图像迭代顺序
        "zoomMarker_TopIndexZ" : function() {
            moveImageTop($(this).attr('id'));
        },
        // 获取canvas绘图层上下文
        "zoomMarker_Canvas": function() {
            const ID = $(this).attr('id');
            const params = getGlobalParam(ID);
            return params.canvas.context;
        },
        // 清空画布
        "zoomMarker_CanvasClean": function() {
            const ID = $(this).attr('id');
            addCanvas(ID);
        },
        // 移动标记点marker
        "zoomMarker_MoveMarker": function(markerId, x, y) {
            const ID = $(this).attr('id');
            const params = getGlobalParam(ID);
            $(params.markerList).each(function(index, marker){
                if(marker.id === markerId) {
                    setMarkerOffset(ID, marker.marker, {x: x, y: y, size: marker.param.size}, params.that.offset());
                    return false;
                }
            });
        },
        // 恢复图像加载后的初始尺寸
        "zoomMarker_ResetImage": function() {
            const ID = $(this).attr('id');
            const params = getGlobalParam(ID);
            const initSize = params.initSize;
            console.log(params.options.markers);
            params.that.width(initSize.width).height(initSize.height).offset({top: initSize.top, left: initSize.left});
            reloadMarkers(ID);
            resizeCanvas(ID);
        },
        // 刷新当前图像的所有标记点
        "zoomMarker_ReloadMarkers": function(){
            const ID = $(this).attr('id');
            reloadMarkers(ID);
        },
    });

    /**
     * 初始化全局变量
     * @param id        当前item的ID，作为标识的唯一KEY
     */
    const initGlobalData = function(id) {
        if(typeof (GLOBAL[id]) === 'undefined') {
            const param = {
                index: gIndex+=2,
                id: id,
                options: {
                    imgNaturalSize: {
                        width: 0,
                        height: 0
                    }  // 图像真实尺寸
                },
                initSize: {
                    width: 0,
                    height: 0,
                    top: 0,
                    left: 0
                },   // 初始尺寸和位置
                that: null,
                dialog: null,
                isInit: false,
                markerList: [],    // 数组，存放marker的DOM对象
                markerId: 0,       // marker的唯一ID，只能增加
                canvas: {
                    item: null,
                    context: null
                }       // canvas绘图层
            };
            GLOBAL.push(param);
            return param;
        } else {
            return GLOBAL[id];
        }
    };

    /**
     * 获取全局变量属性值
     * @param id            item对应ID
     * @returns {*}
     */
    const getGlobalParam = function(id) {
        for(var i = 0; i < GLOBAL.length; ++i) {
            if(GLOBAL[i].id === id) {
                return GLOBAL[i];
            }
        }
        return null;
    };

    /**
     * 异步获取图片大小，需要等待图片加载完后才能判断图片实际大小
     * @param img
     * @param fn        {width:rw, height:rh}
     */
    const getImageSize = function(img, fn){
        img.onload = null;
        // IE兼容问题
        /*if(img.complete){
         fn(_getImageSize(img));
         }
         else{
         img.onload = function(){
         fn(_getImageSize(img));
         }
         }*/
        img.onload = function(){
            fn(_getImageSize(img));
        }
    };

    /**
     * 获取图片大小的子方法，参考getImageSize()
     * @param img
     * @returns {{width: (Number|number), height: (Number|number)}}
     * @private
     */
    const _getImageSize = function(img){
        var rw, rh;
        if (typeof img.naturalWidth === "undefined") {
            // IE 6/7/8
            const i = new Image();
            i.src = img.src;
            rw = i.width;
            rh = i.height;
        }
        else {
            // HTML5 browsers
            rw = img.naturalWidth;
            rh = img.naturalHeight;
        }
        return ({width: rw, height: rh});
    };

    /**
     * 加载图片
     * @param id        调用该方法的item对应的id
     * @param src       加载图片资源路径
     * @param noResize  是否调整图片的位置
     */
    const loadImage = function(id, src, noResize){
        const params = getGlobalParam(id);
        const options = params.options;
        const that = params.that;
        that.trigger("zoom_marker_img_load", src);
        that.attr("src", src);
        that.css("z-index", params.index);
        getImageSize(document.getElementsByName(that.attr('name'))[0], function (size) {
            if(typeof(noResize)==='undefined' || !noResize){
                // 调整图片宽高
                const originWidth = that.width();
                const originHeight = that.height();
                if (options.width != null) {
                    that.width(options.width);
                    that.height(that.width() / originWidth * originHeight);
                }
            }
            // 配置图像尺寸
            options.imgNaturalSize = size;
            params.options.imgNaturalSize = size;
            // 图像居中展示
            if(typeof(noResize)==='undefined' || !noResize) {
                imageCenterAlign(id);
            }
            // 配置初始尺寸
            params.initSize.width = that.width();
            params.initSize.height = that.height();
            params.initSize.left = that.offset().left;
            params.initSize.top = that.offset().top;
            // 图片尺寸加载成功后，配置标记点
            loadMarkers(id, options.markers);
            // 图层置顶
            moveImageTop(id);
            // 是否添加canvas叠加层
            if(options.enable_canvas) {
                addCanvas(id);
            }
            // 广播消息
            that.trigger("zoom_marker_img_loaded", size);
        });
    };

    /**
     * 图像居中
     * @param id    item对应的id
     */
    const imageCenterAlign = function(id){
        const params = getGlobalParam(id);
        const that = params.that;
        // 图像居中
        const offset = that.offset();
        const pDiv = that.parent();
        const top = offset.top + (pDiv.height() - that.height()) / 2;
        const left = offset.left + (pDiv.width() - that.width()) / 2;
        that.offset({top: top > 0 ? top : 0, left: left > 0 ? left : 0});
    };

    /**
     * 加载marker
     * @param id        item对应的id
     * @param markers   需要添加的marker数组
     */
    const loadMarkers = function(id, markers){
        $(markers).each(function(index, marker){
            addMarker(id, marker);
        });
    };

    /**
     * 添加marker
     * @param id    item对应的id
     * @param marker
     */
    const addMarker = function(id, marker) {
        const params = getGlobalParam(id);
        const options = params.options;
        const dialog = params.dialog;
        const that = params.that;
        const markerId = params.markerId;
        const markerList = params.markerList;
        const _marker = $("<div id='" + id + markerId + "' class='zoom-marker'><img draggable='false'><span></span></div>");
        _marker.css('z-index', that.css('z-index') + 1);
        const __marker = _marker.find("img");
        const size = marker.size||options.marker_size;
        const draggable = typeof(marker.draggable) === 'undefined' ? true : marker.draggable;
        var offset = null;
        marker.size = size;
        __marker.attr('src', marker.src);
        // 标记点内容文本
        if(typeof(marker.hint)!='undefined'){
            const span = _marker.find("span");
            span.empty().append(marker.hint.value||"");
            span.css(marker.hint.style||{});
        }
        __marker.height(size);
        __marker.width(size);
        const markerObj = {id:markerId, marker:_marker, param:marker};
        params.markerId++;
        // 标记点点击监听器，延时一段时间再添加，避免移动端重复触发点击事件
        setTimeout(function() {
            _marker.click(function() {
                // hammer拖动结束后会也会触发这个点击事件，所以在这里配置offset=null
                if(offset === null) {
                    if(typeof(marker.click)!="undefined"){
                        marker.click(markerObj);
                    }
                    that.trigger("zoom_marker_click", markerObj);
                }
                offset = null;
            });
        }, 100);
        // 悬浮监听器
        if(typeof(marker.dialog) !== 'undefined'){
            _marker.mousemove(function(e){
                if(offset === null) {
                    options.hover_marker_id = markerObj.id;
                    dialog.empty().append(marker.dialog.value||'').css(marker.dialog.style||{}).show().offset({
                        left: (marker.dialog.offsetX||0) + e.pageX,
                        top: (marker.dialog.offsetY||0) + e.pageY
                    });
                }
            });
            _marker.mouseout(function(){
                options.hover_marker_id = null;
                dialog.hide();
            });
        }
        that.parent().append(_marker);
        markerList.push(markerObj);
        params.markerList = markerList;
        setMarkerOffset(id, _marker, marker, that.offset());
        // 添加拖动监听器
        if(draggable) {
            const picHammer = new Hammer(document.getElementById(_marker.attr('id')));
            picHammer.on("pan", function (e) {
                // 最大及最小宽度限制
                const minX = that.offset().left - marker.size / 2;
                const maxX = minX + that.width();
                const minY = that.offset().top - marker.size;
                const maxY = minY + that.height();
                var x = e.deltaX+offset.left;
                var y = e.deltaY+offset.top;
                if(x < minX) {
                    x = minX;
                } else if(x > maxX) {
                    x = maxX;
                }
                if(y < minY) {
                    y = minY;
                } else if(y > maxY) {
                    y = maxY;
                }
                _marker.offset({left: x, top: y});
            });
            picHammer.on("panstart", function () {
                offset = _marker.offset();
            });
            picHammer.on("panend", function () {
                // 在_marker.click(function()配置offset=null
                //offset = null;
                // 更新marker记录的实际坐标
                const minX = that.offset().left - marker.size / 2;
                const minY = that.offset().top - marker.size;
                markerObj.param.x = (_marker.offset().left - minX) * options.imgNaturalSize.width / that.width();
                markerObj.param.y = (_marker.offset().top - minY) * options.imgNaturalSize.height / that.height();
                that.trigger("zoom_marker_move_end", {
                    x: markerObj.param.x,
                    y: markerObj.param.y,
                    markerObj: markerObj
                });
            });
        }

        return markerObj;
    };

    /**
     * 在拖动或缩放后重新加载图标
     * @param id    item对应的id
     */
    const reloadMarkers = function(id){
        const params = getGlobalParam(id);
        const that = params.that;
        const offset = that.offset();
        $(params.markerList).each(function(index, element){
            setMarkerOffset(id, element.marker, element.param, offset);
        });
    };

    /**
     * 清空标记
     * @param id    item对应的id
     */
    const cleanMarkers = function(id){
        const params = getGlobalParam(id);
        const markerList = params.markerList;
        $(markerList).each(function(index, element){
            element.marker.unbind();
            element.marker.remove();
        });
        params.markerList = [];
        params.options.markers = [];
        params.dialog.hide();
    };

    /**
     * 删除标记
     * @param id        item对应的id
     * @param markerId  标记点的唯一ID
     */
    const removeMarker = function(id, markerId){
        const params = getGlobalParam(id);
        const options = params.options;
        const dialog = params.dialog;
        $(params.markerList).each(function(index, element){
            if(element.id === markerId) {
                element.marker.unbind();
                element.marker.remove();
                // 如果当前悬浮窗在该marker上显示，需要隐藏该悬浮窗
                if(((options.hover_marker_id || null) !== null) && options.hover_marker_id === markerId){
                    dialog.hide();
                }
                return false;
            }
        });
    };

    /**
     * 配置marker的offset
     * @param id            item对应的id
     * @param marker        需要配置的marker对象
     * @param position      marker的位置信息，包含{x: , y: }
     * @param offset        图片的offset信息
     */
    const setMarkerOffset = function(id, marker, position, offset){
        const params = getGlobalParam(id);
        const that = params.that;
        const options = params.options;
        marker.offset({
            left: that.width() * position.x / options.imgNaturalSize.width + offset.left - position.size/2,
            top: that.height() * position.y / options.imgNaturalSize.height + offset.top - position.size
        });
    };

    /**
     * 是否允许图像拖动
     * @param id            item对应的id
     * @param enable        是否允许拖动，布尔型
     */
    const enableDrag = function(id, enable) {
        const params = getGlobalParam(id);
        params.options.enable_drag = enable;
    };

    /**
     * 移动图像和对应标记到顶层
     * @param id            图像id
     */
    const moveImageTop = function(id) {
        const params = getGlobalParam(id);
        // 除了当前图层之外，其他图层都要恢复原来的z-index属性
        GLOBAL.forEach(function(param, index) {
            if(param.id !== id) {
                param.that.css('z-index', param.index);
                param.that.addClass('zoom-marker-opacity');
                // 标记集合的z-index配置为当前图像层级+1
                param.markerList.forEach(function(element, index) {
                    element.marker.css('z-index', param.index + 1);
                    element.marker.addClass('zoom-marker-opacity');
                });
                // canvas层顺序
                if(param.canvas.item !== null) {
                    param.canvas.item.css('z-index', param.index + 1);
                    param.canvas.item.addClass('zoom-marker-opacity');
                }
            }
        });
        // 配置当前图层z-index
        if(typeof(params) !== 'undefined') {
            const markerList = params.markerList;
            const img = params.that;
            img.removeClass('zoom-marker-opacity');
            img.css('z-index', MAX_IMG_Z_INDEX);
            markerList.forEach(function(element, index) {
                element.marker.css('z-index', MAX_IMG_Z_INDEX + 1);
                element.marker.removeClass('zoom-marker-opacity');
            });
            if(params.canvas.item !== null) {
                params.canvas.item.css('z-index', MAX_IMG_Z_INDEX + 1);
                params.canvas.item.removeClass('zoom-marker-opacity');
            }
        }
    };

    /**
     * 如果当前配置的图层在顶部，返回true，否则返回false
     * @param id
     * @return {boolean}
     */
    const isLayoutOnTop = function(id) {
        const params = getGlobalParam(id);
        var maxIndex = -1;
        GLOBAL.forEach(function(param, index) {
            if(param.that.css('z-index') > maxIndex) {
                maxIndex = param.that.css('z-index');
            }
        });
        // 如果当前点击的图层层级和最大层级相同，表明当前点击的图层已在最上层
        return params.that.css('z-index') === maxIndex;
    };

    /**
     * 添加canvas绘图层
     * @param id        需要绘图的图像id
     */
    const addCanvas = function(id) {
        const pItem = $('#' + id + CANVAS_SUFFIX);
        if(pItem !== null) {
            pItem.remove();
        }
        const params = getGlobalParam(id);
        const options = params.options;
        const size = options.imgNaturalSize;
        const that = params.that;
        const item = $("<canvas id='" + id + CANVAS_SUFFIX + "' width='" + size.width + "' height='" +
            size.height + "'  style='z-index: " + (params.index + 1) + "; position: absolute; left: 100px; top: 0px; pointer-events:none'>" +
            "Current browser is not support canvas tag</canvas>");
        that.parent().append(item);
        const context=document.getElementById(id + CANVAS_SUFFIX).getContext("2d");
        params.canvas.item = item;
        params.canvas.context = context;
        resizeCanvas(id);
    };

    /**
     * 重绘canvas层，通过图片ID绑定
     * @param id        需要重绘canvas的图像ID
     */
    const resizeCanvas = function(id) {
        const params = getGlobalParam(id);
        const item = params.canvas.item;
        if(item === null) {
            return;
        }
        const that = params.that;
        const offset = that.offset();
        // 调整位置
        item.offset({
            top: that.offset().top,
            left: that.offset().left
        });
        item.height(that.height());
        item.width(that.width());
    };

    /**
     * 图像预缩放
     * @param img
     * @param targetWidth       缩放后图像宽度
     * @param targetHeight      缩放后图像高度
     * @param targetLeft        缩放后图像左offset
     * @param targetTop         缩放后图像上offset
     * @return {{offset: {top: number, left: number, bottom: *, right: *}, isTerminate: boolean, isOverlap: boolean, width: number, height: number}}
     */
    const limitLockZoom = function(img, targetWidth, targetHeight, targetLeft, targetTop, center) {
        // 获取父容器和图像尺寸
        const superOffset = img.parent().offset();
        const maxX = img.parent().width() + superOffset.left;
        const maxY = img.parent().height() + superOffset.top;
        const minX = superOffset.left;
        const minY = superOffset.top;
        const width = parseInt(img.width());
        const height = parseInt(img.height());
        const parentWidth = parseInt(img.parent().width());
        const parentHeight = parseInt(img.parent().height());
        var result = {
            'isTerminate': false,   // 是否终止缩放
            'isOverlap': false,     // 是否越界
            'height': 0,            // 图像宽度...
            'width': 0,
            'offset': {
                'left': targetLeft,
                'top': targetTop,
                'right': targetLeft + targetWidth,
                'bottom': targetTop + targetHeight
            }
        };
        // 如果是放大操作，只要有一边长度越界就返回，不需要放大
        if((targetWidth > width) && (width >= parentWidth || height >= parentHeight)) {
            result.isTerminate = true;
            return result;
        }
        // 缩放后左边界越界
        if(result.offset.left < minX) {
            result.isOverlap = true;
            result.offset.left = minX;
        }
        // 缩放后右边界越界
        if(result.offset.right > maxX) {
            result.isOverlap = true;
            result.offset.right = maxX;
        }
        // 缩放后上边界越界
        if(result.offset.top < minY) {
            result.isOverlap = true;
            result.offset.top = minY;
        }
        // 缩放后下边界越界
        if(result.offset.bottom > maxY) {
            result.isOverlap = true;
            result.offset.bottom = maxY;
        }
        // 处理
        if(result.isOverlap) {
            result.width = result.offset.right - result.offset.left;
            result.height = result.offset.bottom - result.offset.top;
            if(result.width >= parentWidth) {
                result.height = height * result.width / width;
                result.offset.top = center.y - (center.y - img.offset().top) / height * targetHeight;
                if(result.offset.top < minY) {
                    result.offset.top = minY;
                } else if(result.offset.bottom > maxY) {
                    result.offset.top = maxY - targetHeight;
                }
            } else if(result.height >= parentHeight) {
                result.width = width * result.height / height;
                result.offset.left = center.x - (center.x - img.offset().left) / width * targetWidth;
                if(result.offset.left < minX) {
                    result.offset.left = minX;
                } else if(result.offset.right > maxX) {
                    result.offset.left = maxX - targetWidth;
                }
            }
        }
        return result;
    };

    const limitLockOffset = function(img, x, y) {
        // 获取父容器和图像尺寸
        const superOffset = img.parent().offset();
        const maxX = img.parent().width() + superOffset.left;
        const maxY = img.parent().height() + superOffset.top;
        const width = img.width();
        const height = img.height();
        var offsetX = x;
        var offsetY = y;
        if((offsetX + width) > maxX) {
            offsetX = maxX - width;
        } else if(offsetX < superOffset.left) {
            offsetX = superOffset.left;
        }
        if((offsetY + height) > maxY) {
            offsetY = maxY - height;
        } else if(offsetY < superOffset.top) {
            offsetY = superOffset.top;
        }
        img.offset({top:offsetY, left:offsetX});
    };

    var defaults = {
        rate: 0.2,              // 鼠标滚动的缩放速率
        src: null,              // 图片资源
        width: 500,             // 指定图片宽度
        min: 300,               // 图片最小宽度
        max: null,              // 图片最大宽度
        markers: [],            // marker数组，[{src:"marker.png", x:100, y:100, size:20, click:fn()}]
        marker_size: 20,        // 默认marker尺寸
        enable_drag: true,      // 是否允许拖动，默认允许
        auto_index_z: true,     // 自动配置图像迭代顺序
        enable_canvas: false,   // 是否启用canvas绘图层，会影响性能
        zoom_lock: false,       // 缩放锁定，开启则以图片中点作为缩放中点
        move_limit: false       // 拖动锁边，开启则只允许图片在父容器内部拖动
    }

})(window.jQuery);

