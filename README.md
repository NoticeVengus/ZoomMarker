#Language  
[Chinese](https://github.com/yeye0922/ZoomMarker)  
[English](https://github.com/yeye0922/ZoomMarker/blob/master/language/README_en.md)  

# ZoomMarker
一款用于图片滚动放大拖动，且可以添加标记的jQuery插件  
  
在项目中需要实现类似地图应用那样的，具有鼠标滚动缩放和拖动功能的插件效果，且可以添加具有回调功能的标记点。在网上找了一圈都没有找到合适的，所以图方便自己写了一个。  
如有任何功能问题或改进意见，欢迎反馈，感谢。

## Preview效果预览
[点击这里](https://NoticeVengus.github.io/ZoomMarker/)查看使用[ZoomMarker](https://github.com/NoticeVengus/EasyLoading/)和[EasyLoading](https://github.com/NoticeVengus/EasyLoading/)构建的图片拖拽、缩放、标记及加载动画的示例，使用鼠标或触屏点击在图片上添加标记点，鼠标悬浮在上面查看悬浮提示窗口，使用顶部按钮实现图片切换、清空标记点和加载动画示例等。  
[点击这里](https://NoticeVengus.github.io/ZoomMarker/index_half.html)查看带的分区域显示的例子。  

![Image text](https://github.com/yeye0922/ScreenSample/raw/master/ZoomMarker/gif_1.gif)
![Image text](https://github.com/yeye0922/ScreenSample/raw/master/ZoomMarker/gif_2.gif)

## Version版本

| version  | date | detail        | 
| :-------:|:----:|:-------------:|
| 0.1.9    | 2020.9.25 | 修复了消息回调接口加载marker的问题 |
| 0.1.8    | 2020.8.2  | 添加标记点移动结束回调接口 |
| 0.1.7    | 2020.1.2  | 添加重新加载标记点接口 |
| 0.1.6    | 2019.6.23 | 修正图像锁边缩放逻辑 |
| 0.1.5    | 2019.4.9  | 添加图像位置和大小重置接口 |
| 0.1.4    | 2019.4.1  | 添加图像拖动锁边功能 |
| 0.1.3    | 2019.4.1  | 修复移动端ChromeV8内核图片拖动及marker点击触发问题|
| 0.1.2    | 2019.2.21 | 添加标记点可拖动选项  |
| 0.1.1    | 2019.2.21 | 添加缩放锁定参数  |
| 0.1.0    | 2019.2.13 | 添加Canvas绘图层接口，优化多图层环境体验  |
| 0.0.11   | 2019.2.7  | 多图层环境下，点击非当前图层时将拦截图层切换的发送消息  |
| 0.0.10   | 2018.11.6 | 解决多图像下图片和标记点的迭代顺序问题  |
| 0.0.9    | 2018.11.5 | 解决缩放图片后图片大小不一致问题  |
| 0.0.8    | 2018.9.25 | 支持同时显示多个图片控件  |
| 0.0.7    | 2018.9.25 | 添加允许和禁止图像拖动接口      |
| 0.0.6    | 2018.7.24 | 解决jQuery的context废弃undefined问题      |
| 0.0.5    | 2017.11.13 | 添加图像居中接口，修复重复初始化问题      |
| 0.0.4    | 2017.11.11 | 修正图片显示比例错误的问题      |
| 0.0.3    | 2017.11.8 | 优化接口API      |
| 0.0.2    | 2017.11.3 | 引入Hammer.js处理鼠标操作      |
| 0.0.1    | 2017.10.25 | 初始版本，基础功能      |

## Require依赖

| name  | min-version | detail    |
| :-------:|:----:|:-------------:|
| [jQuery](http://jquery.com/)   | 3.3.1  | JavaScript的DOM操作框架 |
| [jquery.mousewheel](http://plugins.jquery.com/mousewheel/)   | 1.6  | jQuery鼠标滚轮监听插件 |
| [Hammer.js](http://hammerjs.github.io/)| 2.0.4| 多点触控插件    |
| [EasyLoading.js](https://github.com/NoticeVengus/EasyLoading/)| 0.1.0| (可选) 加载动画库    |

在本例子中，还使用了自行编写的开源加载动画插件[EasyLoading](https://github.com/NoticeVengus/EasyLoading/)，该插件同样需要jQuery支持。
如果您对[EasyLoading](https://github.com/NoticeVengus/EasyLoading/)感兴趣，欢迎加星。


## Usages用法
### 1. 快速使用
引入ZoomMarker的JavaScript和CSS文件

    <link rel="stylesheet" href="css/zoom-marker.css">
    <script src="js/zoom-marker.js"></script>

引入第三方依赖库

    <script src="js/jquery-1.11.3.min.js"></script>
    <script src="js/jquery.mousewheel.min.js"></script>
    <script src="js/hammer.min.js"></script>

在示例中，使用了图像加载动画，为此您还需要引入[EasyLoading](https://github.com/NoticeVengus/EasyLoading/)插件，它也可以单独使用。如果您的项目中不需要使用加载动画，则不需要
引入该插件。

    <link rel="stylesheet" href="css/easy-loading.css">
    <script src="js/easy-loading.js"></script>

添加必要的html标签，***注意img标签必须包含唯一的id属性***

    <div id="zoom-marker-div" class="zoom-marker-div">
        <img class="zoom-marker-img" id="zoom-marker-img" alt="..." name="viewArea"  draggable="false"/>
    </div>
在ready()中调用初始化方法

    $(document).ready(function () {
        $('#zoom-marker-img').zoomMarker({
            src: "img/mountain.jpg",
            rate: 0.2,
            width: 600,
            max: 3000,
            markers:[
                {src:"img/marker.svg", x:500, y:500}
                ]
        });
    })
在上述例子中，你还需要在img/目录下添加一个名为moutain.jpg的文件用于显示图片，在img/目录下添加名为marker.svg的文件作为marker文件资源，我们已经在该工程对应目录下添加这两个文件。
现在你可以看到效果了，单击鼠标拖动图片，鼠标滚轮滚动放大缩小图片，添加的标记也会跟着移动。

![Image text](https://github.com/NoticeVengus/ZoomMarker/raw/master/screenshot/sc_2.png)

### 2. 使用Canvas画布绘图
Canvas画布功能在图片div标签上覆盖一层Canvas绘图层，可通过该图层绘制图形。
为了使用Canvas画布功能，需要在初始化ZoomMarker对象时手动配置***enable_canvas***为***true***。

    $('#zoom-marker-img').zoomMarker({
        src: "img/mountain.jpg",
        rate: 0.2,
        width: 400,
        max: 3000,
        markers:[
            {src:"img/marker.svg", x:200, y:200}
        ],
        enable_canvas: true
    });

Canvas图层的大小和图片的实际像素大小相同。
如下例子在鼠标点击图像时，手动绘制一条从[100, 100]坐标出发，至点击坐标点结束的红线。

    item.on("zoom_marker_mouse_click", function(event, position){
        // 画线
        const context = item.zoomMarker_Canvas();
        if(context !== null) {
            context.strokeStyle = 'red';
            context.moveTo(position.x, position.y);
            context.lineTo(100,100);
            context.stroke();
        }
    });



## Parameters参数
初始化时可传入以下可选参数。

| param    | function      | default |
| :-------:|:-------------:|:------:|
| rate     | 缩放速率 | 0.2|
| src      | 图片资源 | _null_|
| width    | 图片加载宽度 | 500|
| min      | 图片最小宽度| 300|
| max      | 图片最大宽度 | _null_|
| markers  |标记点参数数组 | []|
| marker_size | 默认标记点尺寸 | 20|
| enable_drag | 允许拖拽 | true |
| auto_index_z | 自动配置层级 | true |
| enable_canvas | 添加Canvas绘图层 | false |
| zoom_lock | 缩放锁定 | false |
| move_limit | 拖动锁边 | false |

### rate
缺省值0.2
该浮点型参数决定了图片滚动放大时的速率，值越大图片缩放速度越快，范围{0, 1}。
### src
缺省值null，不加载图片
图片加载的路径

### width
用于配置图片加载后的宽度，请不要使用100%之类的相对宽度定位，会影响ZoomMarker的工作。
如果你要使图片的宽度与父节点宽度相同，可以使用jQuery的方法获取父节点宽度，或直接获取"zoom-marker-div"标签的宽度，如：

    $("#zoom-marker-img").parent().width();
    $("#zoom-marker-div").width();

### min
限定图片缩放的最小宽度，默认最小宽度为300px。

### max
限定图片缩放的最大宽度，默认不做限制。

### markers
记录了标记点的参数，包含以下几个参数。

    {
        src: "img/marker.png",   // (required)图片加载路径
        x: 500,                  // (required)标记点在图片中的X坐标
        y: 500,                  // (required)标记点在图片中的Y坐标
        click: function(object){
            // 点击回调方法，object为marker的jQuery对象
        }
    }

### marker_size
标记点尺寸只能为正方形，通过这个参数可以配置标记点的大小，你也可以在"zoomMarker_AddMarker"添加标记点方法中通过参数配置单个标记点的大小。

### enable_drag
是否允许当前图像拖拽

### auto_index_z
自动管理图像和标记点的层级信息，在点击和拖拽的时候自动将当前图像和标记点置顶

### enable_canvas
添加Canvas绘图层，因为可能影响性能，默认关闭

### zoom_lock
缩放锁定，开启则以图片中点作为缩放中点，默认关闭
关闭状态下以鼠标或双指缩放中心作为图片放大或缩小的中点

### move_limit
拖动锁边，开启则只允许图片在父容器内部拖动

## Methods方法
ZoomMarker的方法全都以"zoomMarker_"开头，直接在你的图片标签jQuery对象上使用jQuery插件的方法调用即可，如清空所有标记点：

        $("#viewArea").zoomMarker_CleanMarker();

| name                            | function      |
| :------------------------------:|:-------------:|
| zoomMarker_LoadImage(src)       | 加载图像      |
| zoomMarker_Zoom(center, scale)  | 缩放图片      |
| zoomMarker_Move(x, y)           | 移动图片      |
| zoomMarker_AddMarker(marker)    | 添加标记点    |
| zoomMarker_RemoveMarker(markerId) | 删除标记点  |
| zoomMarker_CleanMarker()        | 清空标记点    |
| zoomMarker_GetPicSize()         | 获取记载图片尺寸    |
| zoomMarker_EnableDrag(enable)   | 是否允许图像拖拽    |
| zoomMarker_TopIndexZ()          | 图像和标记点置顶    |
| zoomMarker_Canvas()             | 获取canvas绘图层上下文  |
| zoomMarker_CanvasClean()        | 清空canvas画布    |
| zoomMarker_ResetImage()         | 重置图像位置及大小 |
| zoomMarker_ReloadMarkers()      | 刷新当前图像的所有标记点 |

### zoomMarker_LoadImage(src)
用于加载图像，src传入图片URL或本地路径。

| param    | function      |
| :-------:|:-------------:|
| src      | 图像资源路径或URL |

### zoomMarker_Zoom(center, scale)
缩放图片。

| param    | function      |
| :-------:|:-------------:|
| center   | 缩放中心点，相对于document的绝对坐标 |
| scale    | 缩放比例，浮点型，如1.5为缩放到原图的1.5倍大小   |

### zoomMarker_Move(x, y)
移动图片位置，笛卡尔坐标系，左上角坐标为(0, 0)。

| param    | function      |
| :-------:|:-------------:|
| x        | 图片左上角的目标纵坐标 |
| y        | 图片左上角的目标横坐标 |

### zoomMarker_AddMarker(marker)
添加标记点并返回添加标记点的相关参数，marker的配置参数如下表所示。
配置中的"x"和"y"参数均为标记点在图像中的坐标位置。

| param    | function      | detault | required |
| :-------:|:-------------:|:-------:|:--------:|
| x        | 标记点在图像中的X坐标   | _null_    | Y     |
| y        | 标记点在图像中的Y坐标   | _null_    | Y     |
| src      | 标记点图标资源| _null_    | Y     |
| size     | 标记点图标尺寸| 20        | N     |
| dialog   | 悬浮对话框    | _null_    | N     |
| hint     | 标记点内部内容| _null_    | N     |
| click    | 标记点击回调  | _null_    | N     |
| draggable  | 标记点可拖动开关  | _null_    | Y     |

###### (1) dialog

| param    | function      | detault | required |
| :-------:|:-------------:|:-------:|:--------:|
| value    | 对话框内容    | ""      | N        |
| style    | CSS样式       | {}      | N        |
| offsetX  | 对话框X坐标偏移| 0      | N        |
| offsetY  | 对话框Y坐标偏移| 0      | N        |

###### (2) hint

| param    | function      | detault | required |
| :-------:|:-------------:|:-------:|:--------:|
| value    | 标记点内容    | ""      | N        |
| style    | CSS样式       | {}      | N        |

###### (3) return函数返回对象

| param    | function      |
| :-------:|:-------------:|
| id       | 标记点ID      |
| marker   | 标记点的jQuery对象  |
| param    | 用户传入的标记点配置参数|

### zoomMarker_RemoveMarker(markerId)
删除标记点，传入标记点ID，ID可从"zoomMarker_AddMarker(marker)"返回结构体中的"id"项获取。

### zoomMarker_CleanMarker()
清空所有标记点。

### zoomMarker_GetPicSize()
获取加载图片的真实尺寸，只有当图片加载结束的时候才会返回正确的图片尺寸。

###### return函数返回对象
| param    | function      |
| :-------:|:-------------:|
| width    | 图片宽度      |
| height   | 图片高度      |

### zoomMarker_EnableDrag(enable)
设置是否允许图像拖动。

### zoomMarker_TopIndexZ()
图像和对应的标记点有层级关系，通过这个方法将当前图像和标记点层级置顶。

### zoomMarker_Canvas()
需要在初始化图像时配置enable_canvas参数为true。
获取Canvas的上下文context，通过Canvas绘图方法在图像上绘制图形。
需要注意的是，绘图坐标都是以图像的分辨率为基准。

### zoomMarker_CanvasClean()
清空Canvas的绘图数据。

### zoomMarker_ResetImage()
重置图像尺寸和位置，包括marker和canvas信息。

### zoomMarker_ReloadMarkers()
有网友反馈在移动端加载新图片后，标记点会发生漂移，手动拖拽图片后图标位置恢复正常。  
个人判断是因为不同浏览器的onload图像加载回调触发时间节点不一样导致的，因此添加这个接口，供用户手动重新加载标记点。

## Event事件  
通过"on"或"bind"监听ZoomMarker发送的事件。

    // 监听图片资源加载结束消息，更新UI资源。
    $('#zoom-marker-img').on("zoom_marker_img_loaded", function(event, size){
        console.log("image has been loaded with size: "+JSON.stringify(size));
        /** 更新UI操作 **/
        ...
    });

| name    | function      | param | detail |
| :-------:|:-------------:|:----:|:------:|
| zoom_marker_img_load    | 图片开始加载    | src| 图片资源路径或URL |
| zoom_marker_img_loaded  | 图片已加载完成  | size| 图片尺寸         |
| zoom_marker_click       | 标记点点击      | markerObj| 标记点对象        |
| zoom_marker_mouse_click | 图片点击        | mouseObj | 图片点击对象      |
| zoom_marker_move_end    | Marker移动结束  | {x, y, markerObj} | 位置及标记点组合对象 |

### size
| param    | function      | 
| :-------:|:-------------:|
| width    | 图片宽度      | 
| height   | 图片高度      | 

### markerObj
| param    | function      | 
| :-------:|:-------------:|
| id       | 标记点ID      | 
| marker   | 标记点的jQuery对象  | 
| param    | 用户传入的标记点配置参数| 

### mouseObj
| param    | function      | 
| :-------:|:-------------:|
| pageX    | 点击位置在document中的X坐标      | 
| pageY    | 点击位置在document中的Y坐标      | 
| x        | 点击位置在图像坐标中的X坐标      | 
| y        | 点击位置在图像坐标中的Y坐标      | 

