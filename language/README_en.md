#Language  
[Chinese](https://github.com/yeye0922/ZoomMarker)  
[English](https://github.com/yeye0922/ZoomMarker/blob/master/language/README_en.md)  

# ZoomMarker  
A jQuery plugin for image zoom in and out, customize tags and canvas are also supported.  
You can zoom and drag image by using this plugin. What you have to do is just import this plugin to your project.  
Feedback is welcome for any suggestions.  

## Preview
[Click Here](https://yeye0922.github.io/ZoomMarker/) for an example with basic usages.  
[Click Here](https://yeye0922.github.io/ZoomMarker/index_half.html) for an example with different region views. They can show images without disturbing each other.

![Image text](https://github.com/yeye0922/ScreenSample/raw/master/ZoomMarker/gif_1.gif)
![Image text](https://github.com/yeye0922/ScreenSample/raw/master/ZoomMarker/gif_2.gif)

## Version

| version  | date | detail        | 
| :-------:|:----:|:-------------:|
| 0.1.6    | 2019.6.23 | fix image zoom lock |
| 0.1.5    | 2019.4.9  | reset function for position and size |
| 0.1.4    | 2019.4.1  | lock function for image dragging |
| 0.1.3    | 2019.4.1  | fix problems performing on mobile ChromeV8 engine|
| 0.1.2    | 2019.2.21 | tag draggable switch function |
| 0.1.1    | 2019.2.21 | zoom lock  |
| 0.1.0    | 2019.2.13 | CANVAS is supported  |
| 0.0.11   | 2019.2.7  | message block on multi-layer situation |
| 0.0.10   | 2018.11.6 | fix the order problem of images and tags on multi-layer situation  |
| 0.0.9    | 2018.11.5 | fix the problem of size changing after image zoom operations |
| 0.0.8    | 2018.9.25 | support multi-image  |
| 0.0.7    | 2018.9.25 | append draggable switch function  |
| 0.0.6    | 2018.7.24 | fix the problem of deprecated context interface in jQuery   |
| 0.0.5    | 2017.11.13 | append center align function, fix the initialization problem   |
| 0.0.4    | 2017.11.11 | fix the ratio problem  |
| 0.0.3    | 2017.11.8 | API optimization  |
| 0.0.2    | 2017.11.3 | import Hammer.js to handle mouse operations |
| 0.0.1    | 2017.10.25 | first version   |

## Require

| name  | min-version | detail    |
| :-------:|:----:|:-------------:|
| [jQuery](http://jquery.com/)   | 3.3.1  | DOM framework with JavaScript |
| [jquery.mousewheel](http://plugins.jquery.com/mousewheel/)   | 1.6  | jQuery plugin for mouse wheel |
| [Hammer.js](http://hammerjs.github.io/)| 2.0.4| multi touch plugin    |
| [EasyLoading.js](https://github.com/yeye0922/EasyLoading/)| 0.1.0| (optional) loading animation plugin   |

I use an other plugin written by myself in the above sample: [EasyLoading](https://github.com/yeye0922/EasyLoading/)  
This plugin should also using jQuery.  
If you are interesting with [EasyLoading](https://github.com/yeye0922/EasyLoading/), please add a little star.


## Usages
### 1. Quick start
Import JavaScript and CSS files of ZoomMarker.  

    <link rel="stylesheet" href="css/zoom-marker.css">
    <script src="js/zoom-marker.js"></script>

Import 3rd libraries.  

    <script src="js/jquery-1.11.3.min.js"></script>
    <script src="js/jquery.mousewheel.min.js"></script>
    <script src="js/hammer.min.js"></script>

The example above has used loading animation, so I also import an other plugin named [EasyLoading](https://github.com/yeye0922/EasyLoading/). 
It can be used independently so importing is unnecessary if you do not need loading at all.  
Import this loading animation plugin:  

    <link rel="stylesheet" href="css/easy-loading.css">
    <script src="js/easy-loading.js"></script>

Add the necessary html tags, ***ATTENTION!! img tag SHOULD has a unique id attribute for its own***  

    <div id="zoom-marker-div" class="zoom-marker-div">
        <img class="zoom-marker-img" id="zoom-marker-img" alt="..." name="viewArea"  draggable="false"/>
    </div>
    
Triggering initialization function in ready()  

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
    
As we can see, moutain.jpg is a sample image file that shown in this example, and marker.svg should be also placed in img/ folder as marker resource, 
these two files has already placed in their position.  
Now you can see what ZoomMarker looks like. Just drag and zoom the image, click to add some tags above image.  

![Image text](https://github.com/yeye0922/ZoomMarker/raw/master/screenshot/sc_2.png)

### 2. Drawing with Canvas
I have placed a transparent layer above an image with same size to support canvas drawing.  
To using Canvas drawing function, you should set up ***enable_canvas*** parameter to ***true*** in initialization method.  

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

The Canvas layer is same size to the ***real*** pixel size of image.  
In the example below, I wrote a line start from [100, 100] to the position of mouse clicking.  

    item.on("zoom_marker_mouse_click", function(event, position){
        // draw a line
        const context = item.zoomMarker_Canvas();
        if(context !== null) {
            context.strokeStyle = 'red';
            context.moveTo(position.x, position.y);
            context.lineTo(100,100);
            context.stroke();
        }
    });

## Parameters
The parameters below are supported in initialization method.  

| param    | function      | default |
| :-------:|:-------------:|:------:|
| rate     | zoom speed ratio | 0.2|
| src      | image resource| _null_|
| width    | loading width of image | 500|
| min      | minimum width of image| 300|
| max      | maximum width of image | _null_|
| markers  | parameter arrays for markers | []|
| marker_size | default pixel size of marker | 20|
| enable_drag | draggable or not | true |
| auto_index_z | config layer order automatically | true |
| enable_canvas | enable Canvas layer | false |
| zoom_lock | image can not be zoomed with center align | false |
| move_limit | image can not be dragged out of the region of its parent | false |

### rate
Value 0.2 default.  
The floating point parameter determines the rate at which the image is scrolled and enlarged. The larger the value, the faster the image is zoomed, the range {0, 1}.  

### src
null for default, will not load image.  
Defining the path of image for loading.  

### width
Used to configure the width of the image after loading, please do not use relative width positioning such as 100%, which will affect ZoomMarker works.  
If you want to make the image as width as its with parent, using jQuery method to get the width of its parent, or directly get the width of the "zoom-marker-div" tag, such as:  

    $("#zoom-marker-img").parent().width();
    $("#zoom-marker-div").width();

### min
Limit the minimum width of the image zoom, the default minimum width is 300px.  

### max
Limit the maximum width of the image zoom, no restrictions by default.  

### markers
Recorded the parameters of the marked point, including the following parameters:  

    {
        src: "img/marker.png",   // (required) path for image loaded
        x: 500,                  // (required) X axis of marker
        y: 500,                  // (required) Y axis of marker
        click: function(object){
            // feed back function after click event happened, object is the jQuery instance of marker
        }
    }

### marker_size
The point size can only be square. You can configure the size of the point by this parameter.  
You can also configure the size of a single point by parameter in the "zoomMarker_AddMarker" add point method.  

### enable_drag
Draggable function is enabled for this image or not.  

### auto_index_z
Automatic management of image and point level information, automatically pin the current image and marker points when clicking and dragging.  

### enable_canvas
Add Canvas drawing layer, as it may affect performance so turned off by default.  

### zoom_lock
Zoom lock, turn on the point in the picture as the zoom midpoint, off by default.  
In the off state, use the mouse or two-finger zoom center to zoom in or out as the midpoint of the picture.  

### move_limit
Drag the seam and open it to only drag the image inside the parent container.  

## Methods
ZoomMarker's methods all start with "zoomMarker_" and can be called directly on your image tag jQuery object using the jQuery plugin method, such as clearing all the mark points:  

        $("#viewArea").zoomMarker_CleanMarker();

| name                            | function      |
| :------------------------------:|:-------------:|
| zoomMarker_LoadImage(src)       | load image      |
| zoomMarker_Zoom(center, scale)  | zoom image      |
| zoomMarker_Move(x, y)           | change the position of image   |
| zoomMarker_AddMarker(marker)    | add a customized mark   |
| zoomMarker_RemoveMarker(markerId) | delete mark |
| zoomMarker_CleanMarker()        | clean up marks    |
| zoomMarker_GetPicSize()         | get the real size of image  |
| zoomMarker_EnableDrag(enable)   | enable draggable or not  |
| zoomMarker_TopIndexZ()          | move image and tags to the top layer   |
| zoomMarker_Canvas()             | get the context of Canvas layer  |
| zoomMarker_CanvasClean()        | clean up Canvas layer  |
| zoomMarker_ResetImage()         | reset the position and size of image |

### zoomMarker_LoadImage(src)
For image loading, src is the URL or local path of image file.  

| param    | function      |
| :-------:|:-------------:|
| src      | URL or local path of image resource |

### zoomMarker_Zoom(center, scale)
Zoom the image.

| param    | function      |
| :-------:|:-------------:|
| center   | zoom midpoint, the absolute position of document |
| scale    | zoom ratio, float, such as 1.5 to zoom to 1.5 times the original image size  |

### zoomMarker_Move(x, y)
Move the picture position, Cartesian coordinate system, the coordinates of the upper left corner are (0, 0).  

| param    | function      |
| :-------:|:-------------:|
| x        | target ordinate in the upper left corner of the image |
| y        | target abscissa in the upper left corner of the image |

### zoomMarker_AddMarker(marker)
Add a marker point and return the relevant parameters of the added marker point. The configuration parameters of the marker are shown in the following table.  
The "x" and "y" parameters in the configuration are the coordinate positions of the marker points in the image.  

| param    | function      | detault | required |
| :-------:|:-------------:|:-------:|:--------:|
| x | The X coordinate of the marker in the image | _null_ | Y |
| y | The Y coordinate of the marker in the image | _null_ | Y |
| src | Point Icon Resources | _null_ | Y |
| size | Point icon size | 20 | N |
| dialog | hover dialog | _null_ | N |
| hint | Point inside content | _null_ | N |
| click | Tag Click Callback | _null_ | N |
| draggable | Point Draggable Switch | _null_ | Y |

###### (1) dialog

| param    | function      | detault | required |
| :-------:|:-------------:|:-------:|:--------:|
| value | Dialog content | "" | N |
| style | CSS style | {} | N |
| offsetX | Dialog X coordinate offset | 0 | N |
| offsetY | Dialog Y coordinate offset | 0 | N |

###### (2) hint

| param    | function      | detault | required |
| :-------:|:-------------:|:-------:|:--------:|
| value | Point Content | "" | N |
| style | CSS style | {} | N |

###### (3) return object parameters

| param | function |
| :-------:|:-------------:|
| id | Point ID |
| marker | jQuery object for point |
| param | User passed in point configuration parameters |

### zoomMarker_RemoveMarker(markerId)
Delete the marker point, pass in the marker point ID, and the ID can be obtained from the "id" item in the structure returned by "zoomMarker_AddMarker(marker)".

### zoomMarker_CleanMarker()
Clear all points.

### zoomMarker_GetPicSize()
Get the actual size of the loaded image, only return the correct image size when the image is loaded.

###### return function returns an object
| param | function |
| :-------:|:-------------:|
| width | Image Width |
| height | image height |

### zoomMarker_EnableDrag(enable)
Set whether to allow image dragging or not.  

### zoomMarker_TopIndexZ()
The image has a hierarchical relationship with the corresponding marker points, and the current image and marker point levels are topped by this method.  

### zoomMarker_Canvas()
The enable_canvas parameter needs to be set to true when the image is initialized.  
Get the context context of the Canvas and draw the image on the image through the Canvas drawing method.  
It should be noted that the drawing coordinates are based on the resolution of the image.

### zoomMarker_CanvasClean()
Empty the drawing data of the Canvas.  

### zoomMarker_ResetImage()
Reset image size and position, including marker and canvas information.  

## Event
Listen for events sent by ZoomMarker via "on" or "bind".  

    // monitor image resource loading end message, update UI resource
    $('#zoom-marker-img').on("zoom_marker_img_loaded", function(event, size){
        console.log("image has been loaded with size: "+JSON.stringify(size));
        /** UI should be updated **/
        ...
    });

| name | function | param | detail |
| :-------:|:-------------:|:----:|:------:|
| zoom_marker_img_load | Image Loading | src| Image Resource Path or URL |
| zoom_marker_img_loaded | Image has been loaded | size| Image Size |
| zoom_marker_click | Point Click | markerObj| Point Object |
| zoom_marker_mouse_click | Image Click | mouseObj | Image Click Object |

### size
| param | function |
| :-------:|:-------------:|
| width | Image Width |
| height | image height |

### markerObj
| param | function |
| :-------:|:-------------:|
| id | Point ID |
| marker | jQuery object for point |
| param | User passed in point configuration parameters |

### mouseObj
| param | function |
| :-------:|:-------------:|
| pageX | Click the X coordinate of the position in the document |
| pageY | Click on the Y coordinate of the document in the document |
| x | Click the X coordinate of the position in the image coordinates |
| y | Click the Y coordinate of the position in the image coordinates |

