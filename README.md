Ajax-uploader
=============

...but it's not ajax really. Naming thing is hard .(


Files uploader
==============

It's javascript class for dynamic uploading of files via iframe.
* create hidden iframe and use it as the target for form
* form is proceeded on background, then reseted and can be reused
* upload's response can contain data to be displayed in no time

Basic uploader
--------------

* ...just upload data and that's all
* *selInputWrapper have to be inside form or to be form itself (always)*

<pre>
<script>
	new AjaxUploader({
		selInputWrapper: ".input_wrapper"
	});
</script>
<form action="/image/upload/" method="post" enctype="multipart/form-data">
    <div class="input_wrapper">
		<input type="file" name="image"/>
	</div>
</form>
</pre>


Uploader with status messages
-----------------------------

* display messages while upload

<pre>
<script>
	new AjaxUploader({
		selInputWrapper: ".input_wrapper",
		selMessages: ".upload_messages"
	});
</script>
<form action="/image/upload/" method="post" enctype="multipart/form-data">
    <div class="input_wrapper">
		<input type="file" name="image"/>
	</div>
</form>
<div class="upload_messages">
	<div class="alert">Shows sucess/progress/alert informations</div>
	<div class="progress">Progress bar while uploading</div>
</div>
</pre>


Uploader with response canvas
-----------------------------

* provides canvas to display data from response

<pre>
<script>
	new AjaxUploader({
		selInputWrapper: ".input_wrapper",
		selThumbnails: ".canvas"
	});
</script>
<form action="/image/upload/" method="post" enctype="multipart/form-data">
    <div class="input_wrapper">
		<input type="file" name="image"/>
	</div>
</form>
<div class="canvas">
	<!--
	this node will contains html from response if response contains
	following json structure:

	[{
		file: {
			html: "<p>result to display in this node</p>"
		}
	}]

	-->
</div>
</pre>


Object options
==============


* msgUploading
message displayed while uploading
* msgUploadError
message for upload error
* msgUploadSuccess
message for complete upload
* msgDeleteConfirm
message for delete confirmation

* selInputWrapper
selector for close wrapper of file input
* selMessages
selector for close messages' wrapper
* selThumbnails
selector for (response's) thumbnails wrapper
* selThumbnailWrapper
selector for existing thumbnail (used while deleting to remove given DOM node)
* selFormMirror
selector for mirror form
- when there's a need to have input in different form which has mismatching params (target/enctype/method) then you can use another (hidden) form to submit your input. File input is copied in there and given form is submitted instead of input's parent form.

* djangoCsrf
if you use Django, csrf token is added. Set to false otherwise
* onUpload
your custom action to run after success upload
* beforeUpload
your custom action to run before upload
