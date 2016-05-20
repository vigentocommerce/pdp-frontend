/* Javascript actions for frontend theme */
define(['jquery', 'spectrum'], function($, spectrum) {
	var mainContent = '.mainContent';
	/* Tab chinh bao gom Your Items | Add Image | Add Text | Add Notes */
	$(mainContent).on('click touchstart', '[data-tab]' , function(){
		var tab_name = $(this).data('tab');
		$('[data-tab], [data-tab-content]').removeClass('active');
		$(this).addClass('active');
		$('[data-tab-content='+tab_name+']').addClass('active');
		switch (tab_name){
			case 'addimage':
				// Show upload and gallery as default. Hide all other section
				$('[data-image-section]').hide();
				$('[data-image-section="gallery"]').show();
				/* Toggle image tab when click link */
				$('[data-image-tab]').on('click touchstart', function(){
					$('[data-image-tab]').removeClass('current');
					$(this).toggleClass('current');
					var $section = $(this).data('image-tab');
					$('[data-image-section]').hide();
					$('[data-image-section="'+$section+'"]').toggle();
				});
				/* Toggle inline image tab in upload section */
				$('[data-inline-tab]').on('click touchstart', function(){
					$('[data-inline-tab]').removeClass('current');
					$(this).toggleClass('current');
					var $section = $(this).data('inline-tab');
					$('[data-inline-section]').hide();
					$('[data-inline-section="'+$section+'"]').toggle();
					$('[data-inline-section] .close').on('click touchstart',function(){$(this).parent().hide();});
				});
				/* Style for file input */
				$('[data-file]').on('change touchstart', function(e){
					var $value = $(this).data('file');
					var fileName = e.target.value.split( '\\' ).pop();
					switch($value){
						case 'upload':
							if(fileName) {
								$(this).parent().find('.label').text(fileName);
								}
						break;
					}
				});
				/* Click on main artwork catalog then open sub category */
				$('[data-gallery="catalog"] ul li').on('click touchstart',function(){
						$('[data-gallery="catalog"]').hide();
						$('[data-gallery="sub-catalog"]').show();
				});
				/* Click on sub category then open artwork item */
				$('[data-gallery="sub-catalog"] li').on('click touchstart',function(){
					$('[data-gallery="sub-catalog"]').hide();
					$('[data-gallery="items"]').show();
				});
				/* Click to return main category */
				$('[data-gallery="reset"]').on('click touchstart',function(){
					$('[data-gallery="sub-catalog"]').hide();
					$('[data-gallery="items"]').hide();
					$('[data-gallery="catalog"]').show();
				});
				
				
			break;
		}
		
	});
	/* Data-POPUP */
	$(mainContent).on('click', '[data-popup]', function(){
		var $pop = $(this).data('popup'); 
		if($(this).hasClass('active')){
			$(this).removeClass('active');
			$('[data-popup-content='+$pop+']').removeClass('active');
		}else{
			$('[data-popup], [data-popup-content]').removeClass('active');
			$(this).addClass('active');
			$('[data-popup-content='+$pop+']').addClass('active');
		}
	});
	$('.product').each(function(){
		/*  Moi tab co phan change du lieu khi click vao moi product item
			Moi selector "change" se co noi dung tuong ung trong "change-content"
		*/
		var $product = $(this);
		$(this).find('[data-change]').on('click touchstart',function(){
			var $selector = $(this).data('change');
			switch($selector){
				case 'product':	
				$('.selected-items').hide();
				$('[data-change-content="'+$selector+'"]').show();
				$('.close').on('click',function(){
					$('.selected-items').show();
					$('[data-change-content="'+$selector+'"]').hide();
				});
				break;
				case 'details':	
				$product.find('[data-change-content="'+$selector+'"]').toggle();
				break;
				
			}
		});
	});
	$(mainContent).on('click touchstart', '.add-more button', function(){
		$('.selected-items').hide();
		$('[data-change-content="product"]').show();
	});
	$(mainContent).on('click touchstart', '.product-list .close', function(){
		$('.selected-items').show();
		$('[data-change-content="product"]').hide();
	});
	$(mainContent).on('click touchstart', '.font-options .close', function(){
		$('.tab-content').show();
		$('.font-options').hide();
	});
	$(mainContent).on('click touchstart', '.curves-thumbnail' ,function(){
		$('.select-curves > li').each(function(){
			$(this).on('click touchstart',function(){
			var imgSrc = $(this).find('img').attr('src');
			$('.curves-thumbnail > a img').attr('src',imgSrc);
			});
		});
		$(this).find('.select-curves').toggle();
		});

	/* Action on tab text */
	$(mainContent).on('click touchstart', '[data-text-field]' ,function(){
		
		var field = $(this).data('text-field');
		var $this = $(this);
		
		//console.log(field);
		switch(field){
			case 'object':
			$('[data-text-field="preview"] textarea').text($(this).val());
			$(this).keyup(function() {
				var style ='';
				$('[data-text-field="preview"] textarea').text($(this).val());
				//console.log($('[data-text-field="preview"]').val());
				
				
			});
			break;			
			case 'font':
			//Show font family list
			$('.tab-content.text').hide();
			$('.font-options').show();
			//$('.font-options').toggleClass('expanded');
			//Get font family
			$('.font-list li a').click(function(){
				$this.attr("style", $(this).attr("style"));
				$this.val($(this).text());
				$('.tab-content.text').show();
				$('.font-options').hide();
			});
			break;
		}
		
	});
	/* Color picker */
	$('[data-text-field="color"], [data-text-field="outlinecolor"]').spectrum({
		showPaletteOnly: true,
		showInput: true,
		showInitial: false,
		togglePaletteOnly: true,
		togglePaletteMoreText: 'More',
		togglePaletteLessText: 'Less',
		color: '#000',
		preferredFormat: "hex",
		palette: [["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]],
		move: function (color) {
			updateInput(color);
		},
		change: function (color){
			updateInput(color);
		}
	});
	setTimeout(function() {
		$('[data-text-field="color"], [data-text-field="outlinecolor"]').spectrum({
			showPaletteOnly: true,
			showInput: true,
			showInitial: false,
			togglePaletteOnly: true,
			togglePaletteMoreText: 'More',
			togglePaletteLessText: 'Less',
			color: '#000',
			preferredFormat: "hex",
			palette: [["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]],
			move: function (color) {
				updateInput(color);
			},
			change: function (color){
				updateInput(color);
			}
		});
	}, 1000);
	/* Update color input value from color picker */
	function updateInput(color) {
		var hexColor = "transparent";
		if(color) {
			hexColor = color.toHexString();
		}
		$('[data-text-field="color"]').val(hexColor);
		$('[data-text-field="outlinecolor"]').val(hexColor);
	}
	/* Toggle advanced text settings */
	$(mainContent).on('click touchstart', '[data-toggle]', function(){
		var $toggle = $(this).data('toggle');
		$('[data-toggle-content="'+$toggle+'"]').toggle();
		$(this).find('.lnr-chevron-down , .lnr-chevron-right').toggleClass('lnr-chevron-down lnr-chevron-right');
	});
		
});