// Generated by CoffeeScript 1.4.0
var AjaxUploader,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

AjaxUploader = (function() {

  AjaxUploader.prototype.defaults = {
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

  AjaxUploader.prototype.deleteFileHook = function() {
    var _this = this;
    return $(this.opts.selThumbnails).on('click', 'input.delete', function(e) {
      _this.deleteFile(e.target);
      return false;
    });
  };

  AjaxUploader.prototype.deleteFile = function(input) {
    var _this = this;
    if (!confirm(this.opts.msgDeleteConfirm)) {
      return;
    }
    $.ajax({
      url: $(input).data('url'),
      type: "POST",
      beforeSend: function(xhr) {
        if (_this.opts.djangoCsrf) {
          xhr.setRequestHeader("X-CSRFToken", _this.getCsrfToken());
          return true;
        }
      },
      success: function() {
        $(input).closest(_this.opts.selThumnailWrapper).remove();
        return false;
      }
    });
    return false;
  };

  AjaxUploader.prototype.getCsrfToken = function() {
    var cookieValue, name, v, x, _i, _len, _ref;
    name = 'csrftoken';
    cookieValue = null;
    if (!document.cookie || document.cookie === '') {
      return;
    }
    _ref = document.cookie.split(';');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      x = _ref[_i];
      v = x.trim();
      if (v.substring(0, name.length + 1) === ("" + name + "=")) {
        cookieValue = decodeURIComponent(v.substring(name.length + 1));
        break;
      }
    }
    return cookieValue;
  };

  AjaxUploader.prototype.uploadFileHook = function() {
    var _this = this;
    return $('input[type=file]', this.opts.selInputWrapper).on('change', function(ev) {
      if (ev.target.value) {
        return _this.uploadFile(ev.target);
      }
    });
  };

  AjaxUploader.prototype.uploadFile = function(input) {
    var cloned, iframeName, res;
    iframeName = this.createIframe();
    res = this.opts.beforeUpload ? this.opts.beforeUpload(input) : this.beforeUpload(input);
    if (!res) {
      return;
    }
    if (this.opts.selFormMirror) {
      cloned = $(input).clone(true);
      cloned.insertBefore(input);
      return $(this.opts.selFormMirror).attr('target', iframeName).find('input[type=file]').remove().end().append(input).submit();
    } else {
      return $(this.opts.selInputWrapper).closest('form').attr('target', iframeName).submit();
    }
  };

  AjaxUploader.prototype.createIframe = function() {
    var iframe, iframeName,
      _this = this;
    if (!this.uploadIframe) {
      iframeName = 'upload_' + (Math.random() * 100000);
      $(this.opts.selFormMirror).closest('form').attr('target', iframeName);
      iframe = $("<iframe name='" + iframeName + "' style='position:absolute;top:-9999px;' />").appendTo('body');
      iframe.load(function() {
        var iframeContent;
        iframeContent = iframe[0].contentWindow.document.body.textContent;
        if (iframeContent) {
          if (_this.opts.onUpload) {
            return _this.opts.onUpload(iframeContent);
          } else {
            return _this.onUpload(iframeContent);
          }
        }
      });
      this.uploadIframe = iframe;
    }
    return this.uploadIframe.attr('name');
  };

  AjaxUploader.prototype.getCanvasItems = function(idx) {
    var canvas, item;
    if (!idx || (idx !== 'alert' && idx !== 'progress')) {
      return this.canvasItems;
    }
    if (__indexOf.call(this.canvasItems, idx) < 0) {
      canvas = $(this.opts.selMessages);
      item = canvas.find("." + idx);
      if (!item.length) {
        item = $("<div class='" + idx + "' style='display:none;'/>");
        canvas.append(item);
      }
      this.canvasItems[idx] = item;
    }
    return this.canvasItems[idx];
  };

  AjaxUploader.prototype.beforeUpload = function(input) {
    var filename;
    filename = input.value.split(/[\/\\]/).pop();
    this.getCanvasItems('progress').show();
    this.showMsg("" + this.opts.msgUploading + " " + filename, 'info');
    return true;
  };

  AjaxUploader.prototype.showMsg = function(msg, msgClass) {
    var alert_node, classes, one, _i, _len;
    if (!this.opts.selMessages) {
      return;
    }
    classes = ['error', 'info', 'success', 'warning'];
    alert_node = this.getCanvasItems('alert');
    for (_i = 0, _len = classes.length; _i < _len; _i++) {
      one = classes[_i];
      alert_node.removeClass("alert-" + one);
    }
    if (__indexOf.call(classes, msgClass) >= 0) {
      alert_node.addClass("alert-" + msgClass);
    }
    return alert_node.html(msg).show();
  };

  AjaxUploader.prototype.onUpload = function(iframeContent) {
    var iframeJSON;
    $("input[type=file]", this.opts.selInputWrapper).val("");
    this.getCanvasItems('progress').hide();
    if (!iframeContent) {
      return;
    }
    try {
      iframeJSON = $.parseJSON(iframeContent);
    } catch (err) {
      this.showMsg(this.opts.msgUploadError, 'error');
      return;
    }
    if (iframeJSON.status !== 'success') {
      this.showMsg(this.opts.msgUploadError, 'error');
      return;
    }
    this.showMsg(this.opts.msgUploadSuccess, 'success');
    if (!this.opts.selThumbnails) {
      return;
    }
    if (iframeJSON.file.html) {
      return $(this.opts.selThumbnails).append(iframeJSON.file.html);
    }
  };

  function AjaxUploader(config) {
    var key, obj, val, _i, _len, _ref;
    this.opts = {};
    _ref = [this.defaults, config];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      obj = _ref[_i];
      for (key in obj) {
        val = obj[key];
        this.opts[key] = val;
      }
    }
    this.canvasItems = {};
    this.uploadIframe = false;
    this.uploadFileHook();
    this.deleteFileHook();
  }

  return AjaxUploader;

})();
