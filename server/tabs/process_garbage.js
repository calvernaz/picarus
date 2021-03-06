function render_process_garbage() {
    row_selector($('#rowPrefixDrop'), {startRow: $('#startRow'), stopRow: $('#stopRow')});
    $('#runButton').click(function () {
        button_running();
        var startRow = unescape($('#startRow').val());
        var stopRow = unescape($('#stopRow').val());
        function success(xhr) {
            response = JSON.parse(xhr.responseText);
            button_reset();
            _.each(response.columns, function (x) {
                $('#results').append(x + '<br>');
            });
        }
        PICARUS.postSlice('images', startRow, stopRow, {data: {action: 'io/garbage'}, success: button_reset, fail: button_error})
    });
}