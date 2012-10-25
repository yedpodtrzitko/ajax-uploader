class AjaxUploader

  defaults:
    {
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
    }

  deleteFileHook: ->
    $(@opts.selThumbnails).on 'click', 'input.delete', (e) =>
      @deletePhoto e.target
      false

  deleteFileNode: ->
    confirm @opts.msgDeleteConfirm
    false

  deleteFile: (input) ->
    if not confirm @opts.msgDeleteConfirm
      return

    $.ajax {
    url: $(input).data('url'),
    type: "POST",
    beforeSend: (xhr) ->
      if @opts.djangoCsrf
        xhr.setRequestHeader "X-CSRFToken", @getCsrfToken()
        false
    success: () ->
      $(input).closest(@opts.selThumnailWrapper).remove()
      false
    }
    false

  getCsrfToken: ->
    name = 'csrftoken'
    cookieValue = null
    if not document.cookie or document.cookie is ''
      return

    for x in document.cookie.split ';'
      v = x.trim()
      if v.substring(0, name.length + 1) is ("#{name}=")
        cookieValue = decodeURIComponent v.substring name.length + 1
        break
    cookieValue

  uploadFileHook: ->
    $('input[type=file]', @opts.selInputWrapper).on 'change', (ev) =>
      if ev.target.value
        @uploadFile ev.target

  uploadFile: (input) ->
    iframeName = @createIframe()
    res = if @opts.beforeUpload then @opts.beforeUpload(input) else @beforeUpload(input)
    if not res
      return

    if @opts.selFormMirror
      #chrome doesn't allow to clone enfilled input[type=file] -> clone and move original
      cloned = $(input).clone true
      cloned.insertBefore input
      $(@opts.selFormMirror).attr('target', iframeName).find('input[type=file]').remove().end().append(input).submit()
    else
      $(@opts.selInputWrapper).closest('form').attr('target', iframeName).submit()

  createIframe: ->
    if not @uploadIframe
      iframeName = 'upload_' + (Math.random() * 100000)
      $(@opts.selInputWrapper).closest('form').attr 'target', iframeName
      iframe = $("<iframe name='#{iframeName}' style='position:absolute;top:-9999px;' />").appendTo 'body'
      iframe.load () =>
        iframeContent = iframe[0].contentWindow.document.body.textContent
        if iframeContent
          if @opts.onUpload
            @opts.onUpload iframeContent
          else
            @onUpload iframeContent
      @uploadIframe = iframe

    @uploadIframe.attr 'name'

  getCanvasItems: (idx) ->
    if not idx or idx not in ['alert', 'progress']
       return @canvasItems

    if idx not in @canvasItems
      canvas = $(@opts.selMessages)
      item = canvas.find ".#{idx}"
      if not item.length
        item = $("<div class='#{idx}' style='display:none;'/>")
        canvas.append item

      @canvasItems[idx] = item
    @canvasItems[idx]

  beforeUpload: (input) ->
    filename = input.value.split(/[\/\\]/).pop()
    @getCanvasItems('progress').show()
    @showMsg "#{@opts.msgUploading} #{filename}", 'info'
    true

  showMsg: (msg, msgClass) ->
    if not @opts.selMessages
      return

    classes = ['error', 'info', 'success', 'warning']
    alert_node = @getCanvasItems 'alert'

    for one in classes
      alert_node.removeClass "alert-#{one}"

    if msgClass in classes
      alert_node.addClass "alert-#{msgClass}"

    alert_node.html(msg).show()

  onUpload: (iframeContent) ->
    $("input[type=file]", @opts.selInputWrapper).val ""
    @getCanvasItems('progress').hide()

    if not iframeContent
      return

    try
      iframeJSON = $.parseJSON iframeContent
    catch err
      @showMsg @opts.msgUploadError 'error'
      return

    if iframeJSON.status isnt 'success'
      @showMsg @opts.msgUploadError, 'error'
      return

    @showMsg @opts.msgUploadSuccess, 'success'
    if not @opts.selThumbnails
      return

    if iframeJSON.file.html
      $(@opts.selThumbnails).append iframeJSON.file.html

  constructor: (config) ->
    @opts = {}
    for obj in [@defaults, config]
        @opts[key] = val for key, val of obj

    @canvasItems = {}
    @uploadIframe = false
    @uploadFileHook()
    @deleteFileHook()


(exports ? this).AjaxUploader = (config) ->
	new AjaxUploader(config)
