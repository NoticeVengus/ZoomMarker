# ZoomMarker
一款用于图片滚动放大拖动，且可以添加标记的jQuery插件  
  
在项目中需要实现类似地图应用那样的，具有鼠标滚动缩放和拖动功能的插件效果，且可以添加具有回调功能的标记点。在网上找了一圈都没有找到合适的，所以图方便自己写了一个。  
如有任何功能问题或改进意见，欢迎反馈，感谢。

##Usage用法  
引入JS和CSS文件  

    <link rel="stylesheet" href="css/zoom-marker.css">
    <script src="js/zoom-marker.js"></script>
添加必要的html元素  
    
    <div id="picview" class="picview">
        <img alt="..." name="viewArea" id="viewArea" draggable="false"/>
    </div>
在ready()中调用初始化方法  

    $(document).ready(function () {
        $('#viewArea').zoomMarker({
            src: "img/mountain.jpg",
            rate: 0.2,
            markers:[
                {src:"img/marker.png", x:500, y:500},
                {src:"img/marker.png", x:0, y:0},
                {src:"img/marker.png", x:1280, y:720, size:20},
                ]
        });
    })
现在你可以看到效果了，单击鼠标拖动图片，中间滚动放大缩小图片，添加的标记也会跟着移动。

![Image text](https://github.com/yeye0922/ZoomMarker/raw/master/screenshot/sc_1.png)

##Parameters参数  
初始化时可传入以下可选参数。
###rate(缩放速率)
缺省值0.2  
该浮点型参数决定了图片滚动放大时的速率，值越大图片缩放速度越快，范围{0, 1}。  
###rc(图片资源)
缺省值null，不加载图片  
图片加载的路径  
###markers(标记点参数数组)
记录了标记点的参数，包含以下几个参数。  

    {
        src:"img/marker.png",   // (required)图片加载路径
        x:500,                  // (required)标记点在图片中的X坐标
        y:500                   // (required)标记点在图片中的Y坐标
    }

