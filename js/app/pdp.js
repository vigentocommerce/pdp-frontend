define(['jquery'], function(jQuery) {  
    var pdcPlugin = (function(global, $) {
        // 'new' an object
        var PDC = function() {
            return new PDC.init();
        };
        // hidden within the scope of the IIFE and never directly accessible
        var config = {
            base_url: 'http://pdp2016.frontend.dev/',
            media_url: 'http://pdp2016.frontend.dev/',
            save_thumbnail_url: $("#base_url").val() + "pdp/index/saveBase64Image/",
            save_json_url: $("#base_url").val() + "pdp/index/saveJsonfile/",
            save_admin_template: $("#base_url").val() + "pdp/index/saveAdminTemplate/",
            image_options: {
                format: 'jpeg',
                quality: $("#image_quality").val() || 0.7
            }, 
            show_log: true,
            // Default image if thumbnail not render successfully
            default_thumbnail: $("#pdp_media_url").val() + "pdp/images/default_thumbnail.jpg",
            rerenderClass: "rerender",
            preview_thumbnail: 'jpg',
            productConfig: ($("#pdc_product_config").length) ? JSON.parse($("#pdc_product_config").val()) : '',
            isServerNginx : ($("#server-nginx").length) ? $("#server-nginx").val() : 0,
        };
        var _sidesConfig = {};
        // prototype holds methods (to save memory space)
        // All core functions place here
        PDC.prototype = {
            version: '2.0.0',
            //All side info place here
            sides: {},
            // Status 0 || 1 (1 mean all ajax done, thumbnail saved) 
            status: 0,
            // Actions: SWITCH_SIDE, SAVE_SAMPLE
            action: '',
            sideIndexBeforeSwitch: 0,
            // Target of current action
            target: {},
            //Newest json filename return from saveJsonFile
            newestJsonFilename : '',
            //Log process
            showLog: function(message, type) {
                //Show log
                if(config.show_log) {
                    type = type || 'log';
                    console[type](message);
                }
            },
            //Flag first load
            firstLoadFlag: true,
            //Sample json, might use in reset function
            sampleDesignJson: '',
            //Each design side has each canvas
            allCanvas: {},
            sideLength: 0,
            getCurrentCanvas: function() {
                var activeSide = this.getActiveSide();
                if(activeSide && activeSide.side_id) {
                    return this.allCanvas[activeSide.id];
                }
            },
            //For access to external canvas, something like from export panel
            setCurrentCanvas: function(fabricCanvas) {
                var self = this;
                if(fabricCanvas instanceof fabric.Canvas) {
                    self.canvas = fabricCanvas;
                }
                return this;
            },
            doRequest: function (url, data, callback) {
                var self = this;
                $.ajax({
                    type: "POST",
                    url: url,
                    data: data,
                    beforeSend: function() {
                        //Developer can using this class to make their own process bar
                        self.showLoadingBar();
                        if(window.Pace !== undefined) {
                            Pace.restart();
                        }
                    },
                    error: function() {
                        console.log("Something went wrong...");
                        alert("Something went wrong! This ajax request has failed.");
                    }, 
                    success: function(response) {
                        callback(response);
                    }
                });
            },
            saveJsonFile: function(options, callback) {
                var self = this;
                if(_sidesConfig) {
                    //this.doRequest(config.save_json_url, {json_content: JSON.stringify(this.sides)}, callback);
                    //this.postData(config.save_json_url, JSON.stringify(this.sides), callback);
                    var _jsonInfoForSave = {
                        options: options || '',
                        side_config: _sidesConfig
                    };
                    $.ajax({
                        type: "POST",
                        url: config.save_json_url,
                        data: JSON.stringify(_jsonInfoForSave),
                        contentType: 'application/json',
                        beforeSend: function() {
                            self.showLoadingBar();
                        },
                        error: function(error) {
                            console.log(error);
                            console.log("Something went wrong...");
                        }, 
                        success: function(response) {
                            callback(response);
                        }
                    });
                }
            },
            //Might need in the future
            postData: function(url, data, callback) {
                // 1. Create XHR instance - Start
                var xhr;
                if (window.XMLHttpRequest) {
                    xhr = new XMLHttpRequest();
                }
                else if (window.ActiveXObject) {
                    xhr = new ActiveXObject("Msxml2.XMLHTTP");
                }
                else {
                    throw new Error("Ajax is not supported by this browser");
                }
                // 1. Create XHR instance - End
                // 2. Define what to do when XHR feed you the response from the server - Start
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        if (xhr.status == 200 && xhr.status < 300) {
                            console.log(xhr.responseText);
                            callback(xhr.responseText);
                        }
                    }
                };
                // 2. Define what to do when XHR feed you the response from the server - End

                // 3. Specify your action, location and Send to the server - Start
                console.info('using XMLHttpRequest');
                xhr.open('POST', url);
                //xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                //xhr.setRequestHeader("Content-Type", "text/plain; charset=UTF-8");
                //xhr.setRequestHeader('Access-Control-Allow-origin', 'true');
                xhr.send(data);
                // 3. Specify your action, location and Send to the server - End
            },
            saveDesignToCustomerAccount: function() {
                var self = this;            
                if(self.checkJSONReady.status == 1) {
                    //Ready to save json
                    var _saveSampleOptions = {
                        action: 'save_customer_design',
                        product_id: self.getCurrentProductId(),
                        design_title: "",
                        design_note: ""
                    };
                    self.saveJsonFile(_saveSampleOptions, function(response) {
                        var responseJSON = JSON.parse(response);
                        if(responseJSON.status == "error") {
                            if(responseJSON.message == "guest") {
                                self.showLoginModal();
                            } else {
                                alert(responseJSON.message);
                                self.showLog("Can not save design to customer account", "warn");   
                            }
                            return false;
                        } else {
                            self.newestJsonFilename = responseJSON.filename;
                            //Reset checking after 
                            self.checkJSONReady.resetChecking();
                            self.saveAndContinue();
                            self.closeIframe();
                        }
                        self.hideLoadingBar();
                    });
                } else {
                    self.saveDesignToJSON(null, $('[pdc-data="SAVE_CUSTOMER_DESIGN"]'));
                }
            },
            saveDesignWithDetailsToCustomerAccount: function() {
                var self = this;            
                if(self.checkJSONReady.status == 1) {
                    //Ready to save json
                    var _saveSampleOptions = {
                        action: 'save_customer_design',
                        product_id: self.getCurrentProductId(),
                        design_title: $("#design_title").val() || "",
                        design_note: $("#design_note").val() || ""
                    };
                    self.saveJsonFile(_saveSampleOptions, function(response) {
                        var responseJSON = JSON.parse(response);
                        if(responseJSON.status == "error") {
                            if(responseJSON.message == "guest") {
                                self.showLoginModal();
                            } else {
                                alert(responseJSON.message);
                                self.showLog("Can not save design to customer account", "warn");   
                            }
                            return false;
                        } else {
                            self.newestJsonFilename = responseJSON.filename;
                            //Reset checking after 
                            self.checkJSONReady.resetChecking();
                            self.saveAndContinue();
                            self.closeIframe();
                        }
                        self.hideLoadingBar();
                    });
                } else {
                    self.saveDesignToJSON(null, $('[pdc-data="SAVE_CUSTOMER_DESIGN_DETAILS"]'));
                }
            },
            saveAndContinue: function() {
                var self = this;
                //Pass data from iframe to parent window
                var mainWindow = top.document;
                self.showLog("Save And Continue", "info");
                //Update json file to extra_options
                self.showLog("Add new json filename to extra_option hidden input. " + self.newestJsonFilename, "info");
                $("input[name='extra_options']", mainWindow).val(self.newestJsonFilename);
                //Update extra_options_value as well
                $("#extra_options_value", mainWindow).val(JSON.stringify(_sidesConfig));
                //Update sample_images hidden field to show preview
                if(global.LoadDesign) {
                    //Prepare sample svg preview
                    var sampleSvg = [];
                    $.each(_sidesConfig, function() {
                        if(this.sideSvg) {
                            sampleSvg.push({
                                side_name: this.label,
                                image_result: this.sideSvg
                            });
                        }
                    });
                    $("#sample_images", mainWindow).val(JSON.stringify(sampleSvg));
                    LoadDesign.showSampleImage();
                    LoadDesign.reloadPrice();
                    self.showLog("Done update thumbnail and reload Price", "info");
                }
            },
            reset: function() {
                this.status = 0;
                this.action = '';
            },
            getActiveSideIndex: function() {
                return this.getActiveSide().index();
            },
            getDesignObjectPrice: function(_canvas) {
                if(!_canvas) return false;
                this.showLog("Calculate final price for current side", "info");
                var total = 0,
                    _objectPrice;
                _canvas.forEachObject(function(o) {
                    _objectPrice = parseFloat(o.price || 0);
                    total += _objectPrice;
                });
                return total;
            },
            isEnableClipartPrice: function() {
                var _isEnable = false;
                if($("#pdc_product_config").length) {
                    var config = JSON.parse($("#pdc_product_config").val());
                    if(config.show_price === '1') {
                        _isEnable = true;
                    } 
                }
                return _isEnable;
            },
            getActiveSide: function() {
                var activeSide;
                if($('[data-popup-content="sideswap"] .side-list li.current').length) {
                    var activeSideId = $('[data-popup-content="sideswap"] .side-list li.current').find('.side-item').attr("id").replace("side-", "");
                    //console.info(activeSideId, "Get Active Side", _sidesConfig[activeSideId]);
                    $.each(_sidesConfig, function(index, side) {
                        if(side.side_id == activeSideId) {
                            activeSide = side;
                            return false;
                        }
                    });
                }
                return activeSide;
            },
            getCurrentProductId: function() {
                return $("#current_product_id").val();
            },
            //init sample data, share, ...
            initSidesData: function() {
                var _currentJson = this.getSampleJson();
                if(_currentJson) {
                    this.showLog("Assign json to sides properties!", "info");
                    //this.showLog(_currentJson);
                    //this.sides = _currentJson;
                    this.sampleDesignJson = this.getSampleJson();
                    //this.setActiveSideColor();
                    $.extend(_sidesConfig, this.sampleDesignJson);
                }
            },
            resetToSampleDesign: function() {
                //If exists sample, then reset to sample design, else => canvas.clear();
                this.showLog("Reset design to sample design or empty design", "info");
                var self = this,
                    _canvas = self.getCurrentCanvas();
                //Clear overlay image before import
                _canvas.setOverlayImage(null, _canvas.renderAll.bind(_canvas));
                //Try to import sample json
                if(this.getSampleJson()) {
                    var currentIndex = this.getActiveSide().id;
                    if(this.getSampleJson()[currentIndex] && this.getSampleJson()[currentIndex].json) {
                        this.getCurrentCanvas().clear();
                        var jsonString = JSON.stringify(this.getSampleJson()[currentIndex].json) || '';
                        if(jsonString) {
                            self.pdcZoom.resetZoom();
                            this.getCurrentCanvas().loadFromJSON(jsonString, function() {
                                self.getCurrentCanvas().renderAll();
                            });
                        }
                    }
                } else {
                    this.getCurrentCanvas().clear();
                    this.initCanvas();
                }
                $.fancybox.close();
            },
            getSampleJson: function() {
                var self = this,
                    _designInJson,
                    mainWindow = top.document,
                    currentAction = $("#pdp_design_action", mainWindow).val();
                self.showLog("Get Sample JSON if exists!", "info");
                //Not get sample design only but get the json of current action
                //Load sample design in backend iframe, load from iframe
                // Load extra_options_value from iframe, this field will not be changed when design
                switch(currentAction) {
                    case 'edit_cart_item':
                    case 'share_design':
                        //Edit cart function, the extra_options will show on main window only
                        if($("#extra_options_value", mainWindow).length && $("#extra_options_value", mainWindow).val() !== "") { 
                            try {
                                _designInJson = JSON.parse($("#extra_options_value", mainWindow).val());
                                if(_designInJson) return _designInJson;
                            } catch(e) {
                                this.showLog(e, "error");
                            }
                        }
                        break;
                    default:
                        if($("#extra_options_value").length && $("#extra_options_value").val() !== "") {
                            try {
                                _designInJson = JSON.parse($("#extra_options_value").val());
                                if(_designInJson) return _designInJson;
                            } catch(e) {
                                this.showLog(e, "error");
                            }
                        }
                        break;
                }
            },
            downloadPng: function() {
                var self = this,
                    _canvas = pdc.getCurrentCanvas();
                _canvas.clone(function(cloneCanvas) {
                    cloneCanvas.scale = _canvas.scale;
                    cloneCanvas = self.pdcZoom.resetZoomBeforeSave(cloneCanvas);
                    self.doRequest(config.base_url + 'pdp/index/saveBase64ImageExport/', {
                        format: 'png',
                        multiplier: 1,
                        base_code_image: cloneCanvas.toDataURL(),
                        options: {
                            is_backend: $("#is_backend").length,
                        }
                    }, function(response) {
                        self.showLog("The png file response to download png event", "info");
                        var responseJson = JSON.parse(response);
                        if(responseJson.status === "success") {
                            if(config.isServerNginx == '1')
                            {
                                var pdcFileName = responseJson.thumbnail_path;
                                var arPdfUrl = pdcFileName.split('/');
                                var lengthArPdfUrl = arPdfUrl.length;
                                lengthArPdfUrl = lengthArPdfUrl - 1;
                                pdcFileName = arPdfUrl.slice(-1)[0] ;
                                var baseDownloadAfter = $('#link-download-after').val();
                                baseDownloadAfter += '/type/png/file-name/'+pdcFileName;
                                $('a#pdc-show-link-down-link').attr('href',baseDownloadAfter);
                                $.fancybox({
                                    href: '#pdc-show-link-down', 
                                    modal: false,
                                });
                            }
                            else
                            {
                                window.location = responseJson.thumbnail_path;
                            }
                            self.hideLoadingBar();
                            return false;
                        }
                        alert(responseJson.message);
                    });
                });
            },
            downloadPdfFromPng: function() {
                var self = this,
                    _canvas = pdc.getCurrentCanvas();
                _canvas.clone(function(cloneCanvas) {
                    cloneCanvas.scale = _canvas.scale;
                    cloneCanvas = self.pdcZoom.resetZoomBeforeSave(cloneCanvas);
                    self.doRequest(config.base_url + 'pdp/index/createPdfFromPng', {
                        png_string: cloneCanvas.toDataURL(),
                        options: {
                            is_backend: $("#is_backend").length,
                        }
                    }, function(response) {
                        self.showLog("The pdf file response to download png event", "info");
                        var responseJson = JSON.parse(response);
                        if(responseJson.status === "success") {
                            if(config.isServerNginx == '1')
                            {
                                var pdcFileName = responseJson.pdf_url;
                                var arPdfUrl = pdcFileName.split('/');
                                var lengthArPdfUrl = arPdfUrl.length;
                                lengthArPdfUrl = lengthArPdfUrl - 1;
                                pdcFileName = arPdfUrl.slice(-1)[0] ;
                                var baseDownloadAfter = $('#link-download-after').val();
                                baseDownloadAfter += '/type/pdf/file-name/'+pdcFileName;
                                $('a#pdc-show-link-down-link').attr('href',baseDownloadAfter);
                                $.fancybox({
                                    href: '#pdc-show-link-down', 
                                    modal: false,
                                });
                            }
                            else
                            {
                                wwindow.location = responseJson.pdf_url;
                            }
                            self.hideLoadingBar();
                            return false;
                        }
                        alert(responseJson.message);
                    });
                });
            },
            exportThumbnailImageForShare: function() {
                //Export first side
                var _canvas,
                    self = this;
                $.each(this.allCanvas, function() {
                    _canvas = this;
                    return false;
                });
                var maxWidth = 400;
                if(_canvas) {
                    _canvas.clone(function(_canvasForShare) {
                        _canvasForShare.scale = _canvas.scale || 1;
                        if(_canvasForShare.width > maxWidth) {
                            var zoom = maxWidth / _canvasForShare.width;
                            _canvasForShare.setZoom(zoom);
                            _canvasForShare.setWidth(_canvas.width * zoom);
                            _canvasForShare.setHeight(_canvas.height * zoom);
                        } 
                        var src = _canvasForShare.toDataURL({
                                format: 'jpeg',
                                quality: 0.7
                            });
                        //Save this image to server before share
                        self.doRequest( config.save_thumbnail_url, {
                            base_code_image : src,
                            format: 'jpg'
                        }, function(response) {
                            var jsonResponse = JSON.parse(response);
                            if(jsonResponse.status == "success") {   
                                console.info("Save design to json status " + self.checkJSONReady.status);
                                if(self.checkJSONReady.status == 1) {
                                    //Ready to save json
                                    var _saveSampleOptions = {
                                        action: 'save_for_share',
                                        product_id: self.getCurrentProductId(),
                                        note: jsonResponse.thumbnail_path
                                    };
                                    self.saveJsonFile(_saveSampleOptions, function(response) {
                                        self.checkJSONReady.resetChecking();
                                        //console.info("Json ready object", self.checkJSONReady);
                                        var responseJSON = JSON.parse(response);
                                        if(responseJSON.status == "error") {
                                            self.showLog("Can not share this design", "warn");
                                            return false;
                                        } else {
                                            self.newestJsonFilename = responseJSON.filename;
                                            try {
                                                var defaultThumbnail = jsonResponse.thumbnail_path,
                                                    mainWindow = top.document,
                                                    productUrl = $("#product_url").val() + "?share=" + responseJSON.share_id,
                                                    productName = $("head title", mainWindow).text() || 'Customize Product',
                                                    productShortDes = $('meta[name="description"]', mainWindow).attr("content") || "Cool design. Please check it out my friend!";
                                                if(global.addthis !== undefined) {
                                                    $(".share-info img").attr("src", defaultThumbnail).css({
                                                        width: '169px'
                                                    });
                                                    $(".share-info .title").attr("href", productUrl).text(productName);
                                                    $(".share-info .link").attr("href", productUrl).text(productUrl);
                                                    $(".share-info .des").text(productShortDes);
                                                    // Method 1
                                                    for(var i = 0; i < global.addthis.links.length; i++){
                                                        global.addthis.links[i].share.url = productUrl;
                                                        global.addthis.links[i].share.title = productName || "Design Your Own";
                                                    }
                                                    self.showShareModal();
                                                    self.hideLoadingBar();
                                                    return;
                                                } else {
                                                    console.info("Add this not ready yet");
                                                }
                                            } catch (error) {
                                                console.info("Add this has problem");
                                                console.error(error);
                                            }
                                        }
                                        self.hideLoadingBar();
                                    });
                                } else {
                                    self.saveDesignToJSON(null, $('[pdc-data="SHARE_DESIGN"]'));
                                }
                            }
                        });
                    });
                }
            },
            readyToShareDesign: function() {
                var self = this,
                    productUrl = $("#product_url").val();
                self.showLog("Prepare add this share link", "info");
                self.saveJsonFile(function(response) {
                    self.showLog("Save json before share action", "info");
                    var responseInJson = JSON.parse(response);
                    if(responseInJson.status == "success") {
                        //Show share thumbnail
                        $(".share-thumbnails").html("");
                        $.each(self.sides, function() {
                            var listHtml = "<li><img src='"+ this.image_result +"' width='200px' alt='"+ this.side_name +"' /></li>";
                            $(".share-thumbnails").append(listHtml);
                        });
                        //Update share url
                        try {
                            var newUrl =  productUrl + "?share=" + responseInJson.id;
                            if(global.addthis !== undefined) {
                                // Method 1
                                for(var i = 0; i < global.addthis.links.length; i++){
                                    global.addthis.links[i].share.url = newUrl;
                                    global.addthis.links[i].share.title = "Design Your Own";
                                }
                                //Method 2
                                /* addthis.update('share', 'url', newUrl); 
                                addthis.url = newUrl;                
                                addthis.toolbox(".addthis_toolbox"); */
                                $("#sharingPopup").modal("show");
                                self.hideLoadingBar();
                                return;
                            }
                        } catch (error) {
                            
                        }                    
                    } else {
                        alert(responseInJson.message);
                    }
                });
            },
            setActiveSideColor: function() {
                var _activeColor = this.getActiveSide().attr("color_code") || "";
                this.showLog("Active color: " + _activeColor, "info");
                if(_activeColor !== "") {
                    $("#colorTab .pdc_design_color li").each(function() {
                        if($(this).attr("color") === _activeColor) {
                            $(this).addClass("selected");
                            return false;
                        }
                    });
                }
                
            },
            //when move from one server to another, some image fixed path in json sample
            updateImagePathBeforeAdd: function(object) {
                if(object.type == "image") {
                    var pdcMediaUrl = config.media_url,
                        oldSrc = object.src;
                    //Skip replace if QRCODE IMAGE from google URL
                    if(oldSrc.match("https://chart.googleapis.com")) {
                        return false;
                    }
                    if(oldSrc !== "" && oldSrc !== undefined) {
                        if(!oldSrc.match(pdcMediaUrl)) {
                            object.src = object.isrc = this.replaceImagePath(oldSrc);
                        }
                    }
                }
                return object;
            },
            replaceImagePath: function(oldSrc) {
                var pdcMediaUrl = config.media_url;
                if(oldSrc !== "" && oldSrc !== undefined) {
                    if(!oldSrc.match(pdcMediaUrl)) {
                        this.showLog("Replace image path", "info");
                        //http://mageboat.com/demopdc/media/pdp/images/artworks/artwork1431746883.png
                        //http://productsdesignercanvas.com/demo/media/pdp/images/
                        //Replace path here
                        var temp = oldSrc.split("/pdp/images/"),
                            newUrl = pdcMediaUrl + temp[1];
                            return newUrl;
                    }
                }
                //Same server will return oldSrc;
                return oldSrc;
            },
            //When render canvas in export panel
            checkImagePathInJson: function(json) {
                if(!json) return;
                var self = this,
                    jsonDecode = (typeof(json) === "object") ? json: JSON.parse(json),
                    backgroundImage = jsonDecode.backgroundImage,
                    overlayImage = jsonDecode.overlayImage,
                    objects = jsonDecode.objects;
                //Update canvas background path
                if(backgroundImage !== undefined && backgroundImage.type == "image") {
                    backgroundImage.src = this.replaceImagePath(backgroundImage.src);
                }
                //Update canvas overlay image path
                if(overlayImage !== undefined && overlayImage.type == "image") {
                    overlayImage.src = this.replaceImagePath(overlayImage.src);
                }
                // Update all object that type = image
                objects.forEach(function(o) {
                    if(o.type == "image") {
                        self.updateImagePathBeforeAdd(o);
                    }
                });
                return JSON.stringify(jsonDecode);
            },
            removeSampleData: function() {
                if(!confirm("Are you sure?")) return false;
                var removeSampleUrl = config.base_url + "pdp/index/removeSampleData/product-id/" + this.getCurrentProductId();
                this.doRequest(removeSampleUrl, {}, function(response) {
                    var responseJson = JSON.parse(response);
                    if(responseJson.status === "success") {
                        window.location.reload();
                    } else {
                        alert(responseJson.message);
                        return false;
                    }
                });
            },
            //Rerender thumbnail when user change product color (the background changed), ...
            //Some actions that effected to the side has rendered.
            //@index start from 0
            reRenderSideThumbnailByIndex: function(index) {
                var sideNth = parseInt(index) + 1;
                var _activeSide = $("#pdc_sides li.pdp_side_item_content:nth-child("+ sideNth +")"),
                    self = this,
                    action = action || "";
                if(!_activeSide.length) {
                    return false;
                }
                //Check side has rendered or not
                if(!self.sides[index]) {
                    return false;
                }
                self.showLog("Rerender side" + index, "info");
                if(_activeSide !== undefined) {
                    var _oldData = self.sides[index];
                    //Update new data to _oldData object
                    var _newData = {
                        side_img: _activeSide.attr("side_img"),
                        side_overlay: _activeSide.attr("overlay"),
                        side_inlay: _activeSide.attr("inlay"), // hold width and height of background image,
                        side_color_id: $(".pdc_design_color li.active").attr("pdc-color") || "",
                        side_color: _activeSide.attr("side_color") || $(".pdc_design_color li.active").attr("color") || "",
                        color_code: _activeSide.attr("side_color") || _activeSide.attr("color_code"),
                    };
                    //Modified json in _oldData before re-render
                    var jsonObj = JSON.parse(_oldData.json);
                    //Skip object and change the background image and overlay image
                    //Just change the path of image, the width and height of them should be equals
                    var newBackgroundImg = config.media_url + _newData.side_img;
                    var newOverlayImg = config.media_url + _newData.side_overlay;
                    jsonObj.backgroundImage.src = newBackgroundImg;
                    jsonObj.overlayImage.src = newOverlayImg;
                    _oldData.json = JSON.stringify(jsonObj);
                    _oldData = $.extend(_oldData, _newData);
                    //self.resetZoom();
                    var canvasSize = _newData.side_inlay.split(","),
                        renderOptions = {
                            canvas_wdith: canvasSize[0],
                            canvas_height: canvasSize[1]
                        };
                    self.renderThumbnail(_oldData.json, renderOptions, function(response) {
                        var _responseJSON = JSON.parse(response);
                        if(_responseJSON.status === "success") {
                            _oldData.image_result = _responseJSON.thumbnail_path;
                            self.sides[index] = _oldData;
                            //After re-render done, remove rerender class and move next
                            $("#pdc_sides li.pdp_side_item_content:nth-child("+ sideNth +")").removeClass(config.rerenderClass);
                            //Continue check next side
                            self.reRenderAllThumbnail();
                        }    
                    });
                    return this;
                }
            },
            addReRenderClass: function() {
                //Skip active side
                //Only render side has rendered
                var self = this,
                    sideNth;
                $.each(self.sides, function(index, side) {
                    if(index != self.getActiveSideIndex()) {
                        sideNth = parseInt(index) + 1;
                        console.info("Need rerender item " + sideNth);
                        $("#pdc_sides li.pdp_side_item_content:nth-child("+ sideNth +")").addClass(config.rerenderClass);
                    }
                });
            },
            reRenderAllThumbnail: function() {
                var self;
                if($(".pdp_side_item_content." + config.rerenderClass).length) {
                    //Render one by one from top
                    var sideIndex = $("li.pdp_side_item_content.rerender:first").index();
                    this.reRenderSideThumbnailByIndex(sideIndex);
                    self.showLoadingBar();
                } else {
                    self.hideLoadingBar();   
                }
                return false;
            },
            getFontList: function() {
                var fonts = [],
                    fontListEl = $("#pdc_font_list");
                if(fontListEl.length && fontListEl.val()) {
                    fonts = JSON.parse(fontListEl.val());
                }
                return fonts;
            },
            getFontFamilyInline: function(fontName) {
                var fontList = this.getFontList();
                if(fontList[fontName]) {
                    var font = '<defs>' +
                        '<style type="text/css">' + 
                            '<![CDATA[' + 
                            '@font-face {'+
                                'font-family: '+ fontName +';' + 
                                'src: url("'+ config.media_url.replace("images", "fonts") + fontList[fontName] +'");'+
                            '}' +
                            ']]>' +
                        '</style>'+
                    '</defs>';
                    return font;
                }
            },
            getSidesConfig: function() {
                return _sidesConfig;
            },
            setSidesConfig: function(config) {
                //console.info(config, 'set side config');
                _sidesConfig = config || {};
            },
            prepareCanvas: function(productConfig) {
                if(productConfig) {
                    var sideListHtml,
                        sortedSideListHtml = '',
                        unsortSideListArr = [],
                        sortedSideListArr = [],
                        counter = 0,
                        designAreaHtml = '',
                        self = this;
                        self.sideLength = 0;
                    $.each(productConfig, function(sideId, side) {
                        self.sideLength++;
                        //Create new canvas
                        if(!$('[data-area="mainview"] .designarea #canvas_side_' + side.side_id).length) {
                            designAreaHtml = '<div id="side-'+ side.side_id +'" class="design-side-item" style="display:none;">';
                            designAreaHtml += '<img src="'+ config.media_url + side.background_image+'"/>';
                            designAreaHtml += '<div class="wrap-canvas" style="top: '+ side.canvas_top +'px; left: '+ side.canvas_left +'px;"><canvas id="canvas_side_'+ side.side_id +'"></canvas></div>';
                            designAreaHtml += '</div>';
                            $('[data-area="mainview"] .designarea').append(designAreaHtml);  
                            self.allCanvas[side.side_id] = new fabric.Canvas('canvas_side_' + side.side_id);
                            self.allCanvas[side.side_id].setWidth(side.canvas_width);
                            self.allCanvas[side.side_id].setHeight(side.canvas_height);
                            self.allCanvas[side.side_id].allowTouchScrolling = true;
                        }
                        sideListHtml = '<li>';
                        sideListHtml += '<a id="side-'+ side.side_id +'" pdc-action="SWITCH_SIDE" class="side-item">';
                        sideListHtml += '<img width="70px" src="'+ config.media_url + (side.thumbnail || side.background_image) +'"/>';        
                        sideListHtml += '<span>'+ side.side_name +'</span>';
                        sideListHtml += '</a>';
                        sideListHtml += '</li>';
                        //console.info(sideId, side);
                        unsortSideListArr.push({
                            id: side.side_id,
                            pos: parseInt(side.position || 0),
                            html: sideListHtml
                        });
                        counter++;
                    });
                    //Sort side list follow position attribute
                    sortedSideListArr = unsortSideListArr.sort(function(a, b){
                        return a.pos - b.pos;
                    });
                    $.each(sortedSideListArr, function() {
                        sortedSideListHtml += this.html;                                              
                    });
                    $('[data-popup-content="sideswap"] ul.side-list').html(sortedSideListHtml);
                    //Active first side
                    $('[data-popup-content="sideswap"] ul.side-list li:first').addClass("current");
                    if(counter == 1) {
                        $('[data-popup-content="sideswap"]').hide();
                    }
                    self.initCanvas();
                }
            },
            initCanvas: function() {
                var activeSide = this.getActiveSide();
                if(activeSide) {
                    var sideConfig = activeSide;
                    if(sideConfig) {
                        var _currentCanvas = this.getCurrentCanvas();
                        //Hide all canvas and show active side only
                        $('[data-area="mainview"] .design-side-item').hide();
                        var _activeCanvasSide = $("#canvas_side_" + activeSide.side_id).closest('.design-side-item').addClass("active").show();
                    }
                }
            },
            //Pattern layer or background layer, not canvas background
            addBackgroundLayer: function(src, options, _canvas) {
                var self = this;
                _canvas = _canvas || this.getCurrentCanvas();
                options = options || {};
                //Remove background layer before add
                _canvas.forEachObject(function(obj) {
                    if(obj.object_type && obj.object_type == "background") {
                        _canvas.remove(obj);
                    }
                });
                var tempExt = src.split(".");
                self.showLoadingBar();
                if(tempExt.slice(-1) == "svg") {
                    fabric.loadSVGFromURL(src, function (objects, options) {
                        var loadedObject = fabric.util.groupSVGElements(objects, options);
                        loadedObject.set({
                            top: 0,
                            left: 0,
                            originX: 'left', 
                            price: options.price || 0,
                            originY: 'top',
                            width: parseInt(_canvas.getWidth() - 0), // - 2 fix border not wrap whole canvas
                            height: parseInt(_canvas.getHeight() - 0),
                            alignX: options.alignX || 'min', // none, mid, min, max
                            alignY: options.alignY || 'min',
                            meetOrSlice: options.meetOrSlice || 'slice', // meet
                            selectable: false,
                            object_type: 'background',
                            hasBorders: false,
                            evented: false,
                            isrc: src
                        });
                        _canvas.insertAt(loadedObject, 1);
                        _canvas.renderAll();
                        if(!options.skip_update_background_path) {
                            self.updateBackgroundInfoToSizeConfig(src, self.getActiveSide().id || '');    
                        }
                        self.hideLoadingBar();
                    });
                } else {
                    fabric.Image.fromURL(src, function(oImg) {
                        oImg.set({
                            top: 0,
                            left: 0,
                            originX: 'left', 
                            price: options.price || 0,
                            originY: 'top',
                            width: parseInt(_canvas.getWidth() - 0), // - 2 fix border not wrap whole canvas
                            height: parseInt(_canvas.getHeight() - 0),
                            alignX: options.alignX || 'min', // none, mid, min, max
                            alignY: options.alignY || 'min',
                            meetOrSlice: options.meetOrSlice || 'slice', // meet
                            selectable: false,
                            object_type: 'background',
                            hasBorders: false,
                            evented: false,
                            isrc: src
                        });
                        _canvas.insertAt(oImg, 1);
                        _canvas.renderAll();
                        if(!options.skip_update_background_path) {
                            self.updateBackgroundInfoToSizeConfig(src, self.getActiveSide().id || '');    
                        }
                        self.hideLoadingBar();
                    });
                }
            },
            addBackgroundColorLayer: function(color, options, _canvas) {
                var self = this;
                _canvas = _canvas || this.getCurrentCanvas();
                color = color || '#ffffff';
                options = options || {};
                //Remove background color layer before add
                _canvas.forEachObject(function(obj) {
                    if(obj.object_type && obj.object_type == "background_color") {
                        _canvas.remove(obj);
                    }
                });
                var rectBgColor = new fabric.Rect({
                    width: parseInt(_canvas.width),
                    height: parseInt(_canvas.height),
                    top: 0,
                    left: 0,
                    fill: color,
                    object_type: "background_color",
                    selectable: false,
                    evented: false
                });
                _canvas.insertAt(rectBgColor, 0);
                _canvas.renderAll();
            },
            updateBackgroundInfoToSizeConfig: function(src, sideId) {
                if(!src || !sideId) return;
                var sideElement = $('#side-' + sideId);
                //Try to use thumbnail instead
                var tempFilename = src.split('/').splice(-1);

                var _thumbnailSrc = src.replace(tempFilename, 'resize/resize_' + tempFilename);
                var nImg = document.createElement('img');
                nImg.onload = function() {
                    $('#side-' + sideId).find('img').attr('src', this.src);
                };
                nImg.onerror = function() {
                    console.warn("No Thumbnail Found");
                    sideElement.find('img').attr("src", src);
                };
                nImg.src = _thumbnailSrc;
                this.getSidesConfig()[sideId].background_path = src;
            },
            addOverlayLayer: function(src, options, _canvas) {
                var self = this;
                _canvas = _canvas || this.getCurrentCanvas();
                options = options || {};
                /*_canvas.setOverlayImage(src, _canvas.renderAll.bind(_canvas), {
                    left: 0,
                    top: 0,
                    originX: 'left',
                    originY: 'top',
                    width: parseFloat(_canvas.width),
                    height: parseFloat(_canvas.height)
                });*/
                self.showLoadingBar();
                fabric.Image.fromURL(src, function(img) {
                    img.set({
                        width: parseFloat(_canvas.width), 
                        height: parseFloat(_canvas.height), 
                        originX: 'left', 
                        originY: 'top',
                        top: 0,
                        left: 0,
                        alignX: options.alignX || 'none', // none, mid, min, max
                        alignY: options.alignY || 'none',
                        meetOrSlice: options.meetOrSlice || 'meet', // meet,
                        isrc: src,
                        object_type: 'mask',
                        price: options.price || 0
                    });
                    _canvas.setOverlayImage(img, _canvas.renderAll.bind(_canvas));
                    self.hideLoadingBar();
                });
                
                _canvas.renderAll();
                _canvas.controlsAboveOverlay = true;
            },
            addText: function(text, fontSize) {
                var _canvas = this.getCurrentCanvas();
                var textObj = new fabric.Text(text, {
                    fontFamily: 'Arial',
                    //left: center.left,
                    //top: center.top,
                    fontSize: fontSize || config.productConfig.default_fontsize || 25,
                    textAlign: "left",
                    //perPixelTargetFind : true,
                    fill: config.productConfig.default_color || "#000",
                    price: config.productConfig.text_price,
                    lineHeight: config.productConfig.default_fontheight || 1.3,
                    borderColor: '#808080',
                    cornerColor: 'rgba(68,180,170,0.7)',
                    cornerSize: 16,
                    cornerRadius: 12,
                    transparentCorners: false,
                    centeredScaling:true,
                    rotatingPointOffset: 40,
                    padding: 5
                    //fontStyle: "", //"", "normal", "italic" or "oblique"
                    //fontWeight: "normal", //bold, normal, 400, 600, 800
                    //textDecoration: "", //"", "underline", "overline" or "line-through"
                    //shadow: '', //2px 2px 2px #fff
                    //padding: setting.padding
                });
                textObj.setControlVisible('mt', false);
                _canvas.centerObject(textObj);
                _canvas.add(textObj).setActiveObject(textObj);
                //textObj.selectAll();
                //textObj.enterEditing();
                //textObj.hiddenTextarea.focus();
                _canvas.calcOffset().renderAll();
                this.scrollToCenterDesign();
            },
            addImage: function(src, options, callback) {
                options = options || {};
                if(src) {
                    var ext = src.split("."),
                        _canvas = this.getCurrentCanvas(),
                        self = this;
                    if(ext[ext.length -1] != 'svg') {
                        this.showLoadingBar();
                        fabric.Image.fromURL(src, function(image) {
                            image.set({
                                //left: 0,
                                //top: 0,
                                angle: 0,
                                price: options.price || 0,
                                id: options.id || Date.now(),
                                scaleY: (_canvas.width / image.width / 2) / _canvas.getZoom(),
                                scaleX: (_canvas.width / image.width / 2) / _canvas.getZoom(),
                                isrc: src,
                                object_type: options.object_type || 'image',
                                borderColor: '#808080',
                                cornerColor: 'rgba(68,180,170,0.7)',
                                cornerSize: 16,
                                cornerRadius: 12,
                                transparentCorners: false,
                                centeredScaling:true,
                                rotatingPointOffset: 40,
                                padding: 5
                            });
                            image.setControlVisible('mt', false);
                            image.setCoords();
                            _canvas.centerObject(image);
                            _canvas.add(image).setActiveObject(image);
                            self.hideLoadingBar();
                            if(callback) callback();
                            
                        });   
                    } else {
                        this.addSvg(src, options, callback);
                    }
                }
                this.scrollToCenterDesign();
            },
            addSvg: function (src, options, callback) {
                //test svg: http://localhost/github/x3/media/pdp/images/artworks/artworkimage11414811752.svg
                options = options || {};
                var _canvas = this.getCurrentCanvas();
                fabric.loadSVGFromURL(src, function (objects, _svgOptions) {
                    var loadedObject = fabric.util.groupSVGElements(objects, _svgOptions),
                        zoom = _canvas.getZoom();
                    loadedObject.set({
                        //left: center.left,
                        //top: center.top,
                        fill: options.color || config.productConfig.default_color || null,
                        perPixelTargetFind : true,
                        isrc: src,
                        price: options.price || 0,
                        id: options.id || Date.now(),
                        scaleY: (_canvas.width / loadedObject.width / 2)/zoom,
                        scaleX: (_canvas.width / loadedObject.width / 2)/zoom,
                        object_type: options.object_type || '',
                        borderColor: '#808080',
                        cornerColor: 'rgba(68,180,170,0.7)',
                        cornerSize: 16,
                        cornerRadius: 12,
                        transparentCorners: false,
                        centeredScaling:true,
                        rotatingPointOffset: 40,
                        padding: 5
                    });
                    loadedObject.setControlVisible('mt', false);
                    if (loadedObject.width > _canvas.width) {
                        loadedObject.scaleToWidth(_canvas.width / 2);
                    }
                    _canvas.centerObject(loadedObject);
                    loadedObject.hasRotatingPoint = true;
                    _canvas.add(loadedObject).setActiveObject(loadedObject);
                    _canvas.renderAll();
                    if(callback) callback();
                });
            },
            //Add frame to top position of object stack
            //Should working as mask or overlay. Allow png only
            addFrameToDesign: function(src, options) {
                //var ext = src.split(".");
                //if(ext[ext.length - 1] == 'png') {
                    this.addOverlayLayer(src, options);
                //}
            },
            removeFrameFromDesign: function() {
                var _canvas = this.getCurrentCanvas();
                _canvas.setOverlayImage(null, _canvas.renderAll.bind(_canvas));
                _canvas.renderAll();
            },
            getBaseUrl: function() {
                return config.base_url;
            },
            saveDesignToJSON: function(customAttrs, currentTarget) {
                if(!Array.isArray(customAttrs)) {
                    customAttrs = ['name', 'isrc', 'price', 'object_type', 'selectable', 'scale', 'evented'];
                }
                if(!currentTarget) return false;
                if(_sidesConfig) {
                    var _sideSvg,
                        self = this,
                        _canvas,
                        _finalPrice = 0,
                        _jsonUpdateCounter = 0;
                    //Start checking json ready
                    self.checkJSONReady.status = 0;
                    self.checkJSONReady.currentTarget = currentTarget;
                    self.checkJSONReady.checking();
                    $.each(_sidesConfig, function(index, sideInfo) {
                        //update design info to side object
                        _canvas = self.allCanvas[sideInfo.id];
                        (function(sideInfo, _canvas) {
                            //console.info(sideInfo.id, "Original Canvas", _canvas);
                            _canvas.clone(function(cloneCanvas) {
                                cloneCanvas.scale = _canvas.scale;
                                //console.info("clone canvas scale " + cloneCanvas.scale);
                                cloneCanvas = self.pdcZoom.resetZoomBeforeSave(cloneCanvas);
                                //console.info(sideInfo.id, "Cloned canvas", cloneCanvas);
                                if(self.hasDesignItem(cloneCanvas)) {
                                    //Skip if object is background_color and has color = fffff;
                                    if(cloneCanvas.getObjects().length == 1) {
                                        var firstObj = cloneCanvas.getObjects()[0] || false;
                                        if(!(firstObj.fill && firstObj.object_type && firstObj.object_type == "background_color" && firstObj.fill == "#ffffff")) {
                                            _sideSvg = self.modifiedSvg(cloneCanvas, sideInfo.canvaswidth, sideInfo.canvasheight);
                                            sideInfo.sideSvg = _sideSvg;
                                            sideInfo.json = cloneCanvas.toJSON(customAttrs);
                                        }
                                    } else {
                                        _sideSvg = self.modifiedSvg(cloneCanvas, sideInfo.canvaswidth, sideInfo.canvasheight);
                                        sideInfo.sideSvg = _sideSvg;
                                        sideInfo.json = cloneCanvas.toJSON(customAttrs);    
                                    }
                                    //console.info(sideInfo.id, "Side JSON", sideInfo.json);
                                    _finalPrice = parseFloat(sideInfo.price) + self.getDesignObjectPrice(_canvas);
                                    sideInfo.final_price = _finalPrice.toFixed(2);
                                } else {
                                    sideInfo.final_price = 0;
                                    if(sideInfo.sideSvg || sideInfo.json) {
                                        _sideSvg = self.modifiedSvg(cloneCanvas, sideInfo.canvaswidth, sideInfo.canvasheight);
                                        sideInfo.sideSvg = _sideSvg;
                                        sideInfo.json = cloneCanvas.toJSON(customAttrs); 
                                    }
                                }
                                _jsonUpdateCounter++;
                                if(_jsonUpdateCounter == self.sideLength) {
                                    console.info("All side json updated, change status to 1");
                                    //Call back function will recall on checking function
                                    self.checkJSONReady.status = 1;
                                }
                            }, customAttrs); 
                        })(sideInfo, _canvas);
                    });
                }
            },
            modifiedSvg: function(canvas, boxWidth, boxHeight) {
                var addedFonts = [],
                    self = this,
                    fontList = self.getFontList(),
                    font = "";
                var svg = canvas.toSVG({
                    viewBox: {
                        x: 0,
                        y: 0,
                        width: boxWidth,
                        height: boxHeight
                    }
                }, function(svg) {
                    if(svg.match('font-family')) {
                        $.each(fontList, function(fontName, fontPath){
                            if($.inArray(fontName, addedFonts) == -1 && svg.match('font-family="'+ fontName +'"')) {
                                font = self.getFontFamilyInline(fontName);
                                addedFonts.push(fontName);
                            }
                        });
                        svg = font + svg;    
                    }
                    return svg;
                });
                //Replace width and height to 100%
                svg = svg.replace('width="'+ boxWidth +'"', 'width="100%"');
                svg = svg.replace('height="'+ boxHeight +'"', 'height="100%"');
                svg = svg.replace(/xmidYmid/g, 'xMidYMid');//str.replace(/f/g,'');
                svg = svg.replace(/xminYmin/g, 'xMinYMin');//str.replace(/f/g,'');
                return svg;  
            },
            restoreDesignFromJson: function() {
                var self = this;
                if(_sidesConfig) {
                    $.each(_sidesConfig, function(index, side) {
                        (function(side) {
                            var _canvas = self.allCanvas[side.id];
                            if(_canvas && !_canvas.scale) {
                                self.pdcZoom.autoZoom(_canvas);
                            }
                            if(side.json) {
                                var _validJson = self.checkImagePathInJson(side.json);
                                //Reset overlay before import
                                _canvas.setOverlayImage(null, _canvas.renderAll.bind(_canvas));
                                self.showLoadingBar();
                                _canvas.loadFromJSON(_validJson, function() {
                                    //update overlay size
                                    self.pdcZoom.updateOverlaySize(_canvas);
                                    _canvas.renderAll();
                                    self.hideLoadingBar();
                                }, function(o, object) {
                                    // `o` = json object
                                    // `object` = fabric.Object instance
                                    if(object) {
                                        //Update control border
                                        object.set({
                                            borderColor: '#808080',
                                            cornerColor: 'rgba(68,180,170,0.7)',
                                            cornerSize: 16,
                                            cornerRadius: 12,
                                            transparentCorners: false,
                                            centeredScaling:true,
                                            rotatingPointOffset: 40,
                                            padding: 5
                                        });
                                        object.setControlVisible('mt', false);
                                    }
                                    if(object.object_type && object.object_type == "background") {
                                        self.updateBackgroundInfoToSizeConfig(object.isrc || object.src, side.id);
                                    }
                                    //Scale object when change template
                                    if(_canvas.scale && _canvas.scale != 1) {
                                        var scaleX = object.scaleX;
                                        var scaleY = object.scaleY;
                                        var left = object.left;
                                        var top = object.top;
                                        var currentScale = _canvas.scale;
                                        var tempScaleX = scaleX * currentScale;
                                        var tempScaleY = scaleY * currentScale;
                                        var tempLeft = left * currentScale;
                                        var tempTop = top * currentScale;

                                        object.scaleX = tempScaleX;
                                        object.scaleY = tempScaleY;
                                        object.left = tempLeft;
                                        object.top = tempTop;
                                        object.setCoords();   
                                    }
                                    //Check image exists on the server
                                    if(o && o.type == "image") {
                                        var nImg = document.createElement('img');
                                        //nImg.onload = function() {
                                            // image exists and is loaded
                                            //console.info("Image exists on server!");
                                        //}
                                        nImg.onerror = function() {
                                            // image did not load
                                            console.info("Image not exists on server!");
                                            console.warn("There is image that be used on sample design but not exists on the server! Please remove the sample design and create new sample design.");
                                            _canvas.remove(object);
                                            //canvas.renderAll();
                                        };
                                        nImg.src = o.isrc || o.src;
                                    }
                                });
                                _canvas.renderAll();
                            } else {
                                _canvas.clear();
                                self.addBackgroundColorLayer(null, {object_type: "background_color"}, _canvas);
                            }
                        })(side);
                    });
                }
            },
            closeIframe: function() {
                $.fancybox.close();
                $("#pdc_iframe", top.document).css({"top" : "-100000px"});
                $('.main-container', top.document).show();
                $(".catalog-product-view", top.document).css({"overflow" : "inherit"});
            },
            showLoginModal: function() {
                $.fancybox({
                    href: '#pdc-save-cont', 
                    modal: false,
                });
            },
            showShareModal: function() {
                $.fancybox({
                    href: '#pdc-share-cont', 
                    modal: false,
                });
            },
            showLoadingBar: function() {
                $(".pdploading").show();
            },
            hideLoadingBar: function() {
                $(".pdploading").hide();
            },
            getProductConfig: function() {
                return config.productConfig;
            },
            getProductImageCategoryIds:function() {
                var ids = [],
                    selectedCategories = this.getProductConfig().selected_image;
                if(selectedCategories) {
                    var _selectedCategories = JSON.parse(selectedCategories);
                    $.each(_selectedCategories, function(key, pos) {
                        ids.push(key);
                    });
                }
                return ids;
            },
            hideObjectControl: function() {
                $("#pdc_toolbar_options").hide();
            },
            changeBackgroundColor: function(color) {
                if(color) {
                    this.addBackgroundColorLayer(color);
                    //update background for pattern list
                    $("#background .items-list li a").css({
                        "background-color": color
                    });
                }
            },
            scrollToCenterDesign: function() {
                //Scroll center cavnas
                if($(".scrollbar-map").length) {
                    $(".scrollbar-map").scrollTop($(".scrollbar-map").height() / 2);   
                    $(".scrollbar-map").scrollLeft($(".scrollbar-map").width() / 2);   
                }
            },
            pdcZoom: {
                SCALE_FACTOR: 1.2,
                maxWidth: 4000,
                minWidth: 300,
                maxHeightForAutoZoom: 560,
                zoomIn: function(_canvas, SCALE_FACTOR) {
                    var self = this;
                    _canvas = _canvas || pdc.getCurrentCanvas();
                    if(!self.validateBeforeZoomIn(_canvas)) return false;
                    _canvas.scale = (_canvas.scale || 1) * self.SCALE_FACTOR;
                    _canvas.setHeight(_canvas.getHeight() * self.SCALE_FACTOR);
                    _canvas.setWidth(_canvas.getWidth() * self.SCALE_FACTOR);

                    var objects = _canvas.getObjects();
                    for (var i in objects) {
                        var scaleX = objects[i].scaleX;
                        var scaleY = objects[i].scaleY;
                        var left = objects[i].left;
                        var top = objects[i].top;

                        var tempScaleX = scaleX * self.SCALE_FACTOR;
                        var tempScaleY = scaleY * self.SCALE_FACTOR;
                        var tempLeft = left * self.SCALE_FACTOR;
                        var tempTop = top * self.SCALE_FACTOR;

                        objects[i].scaleX = tempScaleX;
                        objects[i].scaleY = tempScaleY;
                        objects[i].left = tempLeft;
                        objects[i].top = tempTop;

                        objects[i].setCoords();
                    }
                    this.updateOverlaySize(_canvas);
                    _canvas.renderAll();
                    this.updateWrappSize(_canvas);
                    
                },
                zoomOut: function(_canvas, SCALE_FACTOR) {
                    var self = this;
                    _canvas = _canvas || pdc.getCurrentCanvas();
                    if(!self.validateBeforeZoomOut(_canvas)) return false;
                    _canvas.scale = (_canvas.scale || 1) / self.SCALE_FACTOR;
                    _canvas.setHeight(_canvas.getHeight() * (1 / self.SCALE_FACTOR));
                    _canvas.setWidth(_canvas.getWidth() * (1 / self.SCALE_FACTOR));
                    var objects = _canvas.getObjects();
                    for (var i in objects) {
                        var scaleX = objects[i].scaleX;
                        var scaleY = objects[i].scaleY;
                        var left = objects[i].left;
                        var top = objects[i].top;
                        
                        var tempScaleX = scaleX * (1 / self.SCALE_FACTOR);
                        var tempScaleY = scaleY * (1 / self.SCALE_FACTOR);
                        var tempLeft = left * (1 / self.SCALE_FACTOR);
                        var tempTop = top * (1 / self.SCALE_FACTOR);
                        
                        objects[i].scaleX = tempScaleX;
                        objects[i].scaleY = tempScaleY;
                        objects[i].left = tempLeft;
                        objects[i].top = tempTop;
                        objects[i].setCoords();
                    }
                    this.updateOverlaySize(_canvas);
                    _canvas.renderAll();  
                    this.updateWrappSize(_canvas);
                },
                resetZoom: function(_canvas, canvasScale) {
                    var self = this;
                    _canvas = _canvas || pdc.getCurrentCanvas();
                    _canvas.scale = (_canvas.scale || 1);
                    _canvas.setHeight(_canvas.getHeight() * (1 / _canvas.scale));
                    _canvas.setWidth(_canvas.getWidth() * (1 / _canvas.scale));
                    var objects = _canvas.getObjects();
                    for (var i in objects) {
                        var scaleX = objects[i].scaleX;
                        var scaleY = objects[i].scaleY;
                        var left = objects[i].left;
                        var top = objects[i].top;

                        var tempScaleX = scaleX * (1 / _canvas.scale);
                        var tempScaleY = scaleY * (1 / _canvas.scale);
                        var tempLeft = left * (1 / _canvas.scale);
                        var tempTop = top * (1 / _canvas.scale);

                        objects[i].scaleX = tempScaleX;
                        objects[i].scaleY = tempScaleY;
                        objects[i].left = tempLeft;
                        objects[i].top = tempTop;

                        objects[i].setCoords();
                    }
                    self.updateOverlaySize(_canvas);
                    _canvas.renderAll();
                    _canvas.scale = 1;
                    this.updateWrappSize(_canvas);
                },
                updateWrappSize: function(_canvas) {
                    $('[pdc-data="main-canvas"]').css({
                        width: _canvas.getWidth(),
                        height: _canvas.getHeight()
                    });
                    var newWidth = _canvas.getWidth(),
                        //newHeight = _canvas.getHeight(),
                        originalWidth = _canvas.getWidth() * (1 / (_canvas.scale || 1));
                        //originalHeight = _canvas.getHeight() * (1 / this.canvasScale);
                    var percent = (newWidth * 100) / originalWidth;
                    $(".pdc-zoom .input-zoom").val(parseInt(percent) + "%");
                },
                validateBeforeZoomIn: function(_canvas) {
                    if(parseFloat(_canvas.getWidth()) > this.maxWidth) {
                        alert("Canvas size is too big. You shouldn't zoom in any more!");
                        return false;
                    }
                    return true;
                },
                validateBeforeZoomOut: function(_canvas) {
                    if(parseFloat(_canvas.getWidth()) < this.minWidth) {
                        console.warn("Canvas size is too small. You shouldn't zoom out any more!");
                        return false;
                    }
                    return true;
                },
                updateOverlaySize: function(_canvas) {
                    if(_canvas && _canvas.overlayImage) {
                        _canvas.overlayImage.width = _canvas.getWidth();
                        _canvas.overlayImage.height = _canvas.getHeight();
                        //_canvas.renderAll();
                    }
                },
                resetZoomBeforeSave: function(_canvas) {
                    var self = this;
                    if(!_canvas) return;
                    _canvas.scale = _canvas.scale || 1;
                    _canvas.setHeight(_canvas.getHeight() * (1 / _canvas.scale));
                    _canvas.setWidth(_canvas.getWidth() * (1 / _canvas.scale));
                    var objects = _canvas.getObjects();
                    for (var i in objects) {
                        var scaleX = objects[i].scaleX;
                        var scaleY = objects[i].scaleY;
                        var left = objects[i].left;
                        var top = objects[i].top;

                        var tempScaleX = scaleX * (1 / _canvas.scale);
                        var tempScaleY = scaleY * (1 / _canvas.scale);
                        var tempLeft = left * (1 / _canvas.scale);
                        var tempTop = top * (1 / _canvas.scale);

                        objects[i].scaleX = tempScaleX;
                        objects[i].scaleY = tempScaleY;
                        objects[i].left = tempLeft;
                        objects[i].top = tempTop;

                        objects[i].setCoords();
                    }
                    this.updateOverlaySize(_canvas);
                    _canvas.renderAll();
                    return _canvas;  
                },
                autoZoom: function(_canvas) {
                    if(!_canvas) return;
                    if(_canvas.height <= this.maxHeightForAutoZoom) return false;
                    var _scale = 1,
                        _tempHeight = _canvas.height;
                    while(_tempHeight > this.maxHeightForAutoZoom) {
                        _scale *= (1/ this.SCALE_FACTOR);
                        _tempHeight = _tempHeight * (1/ this.SCALE_FACTOR);
                        //console.log(_scale, ' after scale ', _tempHeight);
                    }
                    if(_scale > 0 && _tempHeight <= this.maxHeightForAutoZoom) {
                        //auto zoom out here
                        if(!this.validateBeforeZoomOut(_canvas)) return false;
                        _canvas.originalScale = _scale;
                        this.zoomOutTo(_canvas, _scale);
                    }
                }, 
                zoomOutTo: function(_canvas, _scale) {
                    if(!_canvas || !_scale) return false;
                    _canvas.scale = _scale;
                    _canvas.setHeight(_canvas.getHeight() * _scale);
                    _canvas.setWidth(_canvas.getWidth() * _scale);
                    var objects = _canvas.getObjects();
                    for (var i in objects) {
                        var scaleX = objects[i].scaleX;
                        var scaleY = objects[i].scaleY;
                        var left = objects[i].left;
                        var top = objects[i].top;

                        var tempScaleX = scaleX * _scale;
                        var tempScaleY = scaleY * _scale;
                        var tempLeft = left * _scale;
                        var tempTop = top * _scale;

                        objects[i].scaleX = tempScaleX;
                        objects[i].scaleY = tempScaleY;
                        objects[i].left = tempLeft;
                        objects[i].top = tempTop;
                        objects[i].setCoords();
                    }
                    this.updateOverlaySize(_canvas);
                    _canvas.renderAll();  
                    this.updateWrappSize(_canvas);
                }
            },
            checkJSONReady: {
                status: 0,
                currentTarget: '',
                timeOUt: '',
                checkingTime: 0,
                checking: function() {
                    var self = this;
                    if(self.status != 1 && self.checkingTime < 10) {
                        self.checkingTime++;
                        self.timeOut = setTimeout(pdc.checkJSONReady.checking.bind(self), 300);
                    } else {
                        if(self.status != 1) {
                            console.warn("JSON not ready yet, but time already out. 10s now");
                            console.info("Finish auto call funciton");
                        } else {
                            //Continue current action here
                            console.info("JSON ready, click this action again: " + self.currentTarget);   
                            self.currentTarget.click();
                        }
                        clearTimeout(self.timeOut);
                    }
                },
                resetChecking: function() {
                    this.status = 0;
                    this.currentTarget = '';
                    this.checkingTime = 0;
                }
            },
            changeDesignTemplate: function(jsonFilename, jsonContent) {
                var jsonContentDecoded = JSON.parse(jsonContent);
                _sidesConfig = jsonContentDecoded;
                this.restoreDesignFromJson();
            },
            hasDesignItem: function(canvas) {
                var hasDesignItem = false;
                //Check canvas has design or not, exclude background color and background 
                if(canvas.getObjects()) {
                    var objects = canvas.getObjects();
                    objects.forEach(function(o) {
                        if(o.object_type && (o.object_type == "background_color" || o.object_type == "background")) {
                            if(o.object_type == "background") {
                                var o_src = o.isrc || o.src;
                                if(o_src && o_src.match("images/artworks/")) {
                                    hasDesignItem = true;
                                }
                            }
                        } else {
                            hasDesignItem = true;
                        }
                    });   
                }
                return hasDesignItem;
            },
            isEmptyObject: function(obj) {
                return $.isEmptyObject(obj);
            }
        };
        // the actual object is create here, allowing us to 'new' an object without calling new
        PDC.init = function() {
            var self = this;
            //self.prepareCanvas();
            //self.initCanvas();
            //init sides data, assign json to sides properties
            //self.initSidesData();
            //self.restoreDesignFromJson();
        };
        PDC.init.prototype = PDC.prototype;
        //global.PDC = PDC;
        return PDC;
    }(window, jQuery));
    return pdcPlugin;
});  
