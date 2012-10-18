/*
 AjaxUploader v0.1
 (c) 2012 - yedpodtrzitko
 Licensed under the terms of the BSD license

 I don't usually write comments, but when I do... they're useless.

 Simple dynamic files uploader: create hidden iframe and submit form into it
  via javasript. Response of upload request could contains i.e. thumbnail url
  of proceeded file which you can display as a result in no time.
  Now you're ready to upload another file by the same form.

 input options:
 	msgUploading		message displayed while uploading
 	msgUploadError		message for upload error
 	msgUploadSuccess	message for complete upload
 	msgDeleteConfirm	message for delete confirmation
 	
 	selInputWrapper		selector for close wrapper of file input
 	selMessages			selector for close messages' wrapper
 	selThumbnails		selector for (response's) thumbnails wrapper
 	selThumbnailWrapper	selector for existing thumbnail
 							(used while deleting to remove given DOM node)
 	selFormMirror		selector for mirror form
 							- when there's a need to have input in different form
 							which has mismatching params (target/enctype/method)
 							then you can use another (hidden) form to submit your input.
 							File input is copied in there and given form is submitted instead
 							of input's parent form.
 							- not used if empty
 	djangoCsrf			if you use django, csrf token is added. Set to false otherwise
 	onUpload			your custom action to run after success upload
 	beforeUpload		your custom action to run before upload

 */

AjaxUploader = function (config) {

	var defaults = {
		msgUploading: "Uploading file",
		msgUploadError: "Error uploading file",
		msgUploadSuccess: "File successfuly uploaded",
		msgDeleteConfirm: "Do you really want delete given photo?",

		selInputWrapper: false,
		selThumbnails: false,
		selThumnailWrapper: '.attachment',
		selMessages: false,
		selFormMirror: false,

		djangoCsrf: true,

		onUpload: false,
		beforeUpload: false
	};

	this.opts = $.extend(defaults, (config || {}));
	this.canvasItems = {};
	this.uploadIframe = false;

	this.init();
};

AjaxUploader.prototype = {
	constructor: AjaxUploader,

	init: function () {
		var self = this;
		self.uploadPhotoHook();
		self.deletePhotoHook();
	},

	deletePhotoHook: function () {
		var self = this;
		$(self.opts.selThumbnails).on('click', 'input.delete', function () {
			self.deletePhoto(this);
			return false;
		})
	},

	getCsrfToken: function () {
		var name = 'csrftoken';
		var cookieValue = null;
		if (document.cookie && document.cookie != '') {
			var cookies = document.cookie.split(';');
			for (var i = 0; i < cookies.length; i++) {
				var cookie = jQuery.trim(cookies[i]);
				if (cookie.substring(0, name.length + 1) == (name + '=')) {
					cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
					break;
				}
			}
		}
		return cookieValue;
	},

	deletePhoto: function (input) {
		var self = this;

		if (!confirm(self.opts.msgDeleteConfirm)) {
			return;
		}

		$.ajax({
			url: $(input).data('url'),
			type: "POST",
			beforeSend: function (xhr) {
				if (self.opts.djangoCsrf) {
					xhr.setRequestHeader("X-CSRFToken", self.getCsrfToken());
				}
			},
			success: function () {
				$(input).closest(self.opts.selThumnailWrapper).remove()
			}
		})
	},

	uploadPhotoHook: function () {
		var self = this;

		$('input[type=file]', self.opts.selInputWrapper).on('change', function () {
			if (this.value) {
				self.uploadFile(this)
			}
		});
	},

	uploadFile: function (input) {

		var self = this;
		var res = self.opts.beforeUpload ? self.opts.beforeUpload(input) : self.beforeUpload(input);

		var iframeName = self.createIframe();
		if (self.opts.selFormMirror) {
			//chrome doesn't allow to clone enfilled input[type=file] -> clone and move original
			var cloned = $(input).clone(true);
			cloned.insertBefore(input);
			$(self.opts.selFormMirror).attr('target', iframeName).find('input[type=file]').remove().end().append(input).submit();
		} else {
			$(self.opts.selInputWrapper).closest('form').attr('target', iframeName).submit();
		}
	},

	createIframe: function () {
		var self = this;
		if (!self.uploadIframe) {
			var iframeName = 'upload_' + (Math.random() * 100000);
			$(self.opts.selInputWrapper).closest('form').attr('target', iframeName);

			var iframe = $('<iframe name="' + iframeName + '" style="position:absolute;top:-9999px;" />').appendTo('body');
			iframe.load(function () {
				var iframeContent = iframe[0].contentWindow.document.body.textContent;
				if (iframeContent) {
					self.opts.onUpload ? self.opts.onUpload(iframeContent) : self.onUpload(iframeContent);
				}
			});
			self.uploadIframe = iframe;
		}
		return self.uploadIframe.attr('name');
	},


	getCanvasItems: function (idx) {
		var self = this;

		if (!self.canvasItems.length) {
			var canvas = $(self.opts.selMessages);
			for (var one in {alert: 1, progress: 1}) {
				var item = canvas.find('.' + one);
				if (!item.length) {
					item = $('<div class="' + one + '" style="display:none;"/>');
					canvas.append(item);
				}
				self.canvasItems[one] = item;
			}
		}

		return idx ? self.canvasItems[idx] : self.canvasItems;
	},

	beforeUpload: function (input) {
		var self = this;
		var filename = input.value.split(/[\/\\]/).pop();
		self.getCanvasItems('progress').show();
		self.showMsg(self.opts.msgUploading + " " + filename, 'info');
		return true;
	},

	showMsg: function (msg, msgClass) {
		var self = this;
		if (!self.opts.selMessages) {
			return;
		}

		var classes = {error: 1, info: 1, success: 1, warning: 1};
		var alert = self.getCanvasItems('alert');

		for (var one in classes) {
			alert.removeClass('alert-' + one);
		}
		if (classes.hasOwnProperty(msgClass)) {
			alert.addClass('alert-' + msgClass)
		}

		alert.html(msg).show();
	},

	onUpload: function (iframeContent) {
		var self = this;

		$("input[type=file]", self.opts.selInputWrapper).val("");
		self.getCanvasItems('progress').hide();

		if (!iframeContent) {
			return;
		}

		try {
			var iframeJSON = $.parseJSON(iframeContent);
		} catch (err) {
			self.showMsg(self.opts.msgUploadError, 'error');
			return;
		}

		if (iframeJSON.status != 'success') {
			self.showMsg(self.opts.msgUploadError, 'error');
			return;
		}

		self.showMsg(self.opts.msgUploadSuccess, 'success');
		if (!self.opts.selThumbnails) {
			return;
		}

		if (iframeJSON.file.html) {
			$(self.opts.selThumbnails).append(iframeJSON.file.html);
		}
	}
}
