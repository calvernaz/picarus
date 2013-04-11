function render_data_prefixes() {
    rows = new PicarusRows([], {'table': 'prefixes'});
    function prefixChange() {
        var row = $('#prefixTable option:selected').val();
        var permissions = rows.get(row).pescape($('#prefixDrop option:selected').val());
        ps = permissions;
        var perms = ['r'];
        if (permissions == 'rw')
            perms = ['rw', 'r'];
        var select_template = "{{#prefixes}}<option value='{{.}}'>{{.}}</option>{{/prefixes}};"
        $('#permissions').html(Mustache.render(select_template, {prefixes: perms}));
    }
    function change() {
        var row = $('#prefixTable option:selected').val();
        var prefixes = [];
        _.each(rows.get(row).attributes, function (val, key) {
            if (key == 'row')
                return;
            prefixes.push(decode_id(key));
        });
        prefixes.sort();
        var select_template = "{{#prefixes}}<option value='{{.}}'>{{.}}</option>{{/prefixes}};"
        $('#prefixDrop').html(Mustache.render(select_template, {prefixes: prefixes}));
        $('#prefixDrop').change(prefixChange); // TODO: Redo this in backbone
        prefixChange();
    }
    rows_dropdown(rows, {el: $('#prefixTable'), text: function (x) {return x.pescaperow()}, change: change});
    $('#createButton').click(function () {
        var row = $('#prefixTable option:selected').val();
        var data = {}
        data[$('#prefixDrop option:selected').val() + $('#suffix').val()] = $('#permissions option:selected').val(); 
        rows.get(row).psave(data, {patch: true});        
    });
    var tableColumn = {header: "Table", getFormatted: function() {
        return _.escape(base64.decode(this.get('row')));
    }};
    new RowsView({collection: rows, el: $('#prefixes'), extraColumns: [tableColumn], deleteValues: true});
    rows.fetch();
}
function render_data_projects() {
    rows = new PicarusRows([], {'table': 'projects'});
    rows_dropdown(rows, {el: $('#prefixTable'), text: function (x) {return x.pescaperow()}});
    slices_selector();
    $('#modifyProjectButton').click(function () {
        var row = $('#prefixTable option:selected').val();
        var data = {};
        var slices = slices_selector_get(true);
        var value = _.map(slices, function (x) {return x[0] + '/' + x[1]}).join(',');
        data[$('#projectName').val()] = value;
        rows.get(row).psave(data, {patch: true});
    });
    var tableColumn = {header: "Table", getFormatted: function() {
        return _.escape(base64.decode(this.get('row')));
    }};
    new RowsView({collection: rows, el: $('#prefixes'), extraColumns: [tableColumn], deleteValues: true});
    rows.fetch();
}
function render_data_user() {
    users = new PicarusUsers();
    var AppView = Backbone.View.extend({
        initialize: function() {
            _.bindAll(this, 'render');
            this.collection.bind('reset', this.render);
            this.collection.bind('change', this.render);
        },
        render: function() {
            var columns = _.uniq(_.flatten(_.map(this.collection.models, function (x) {
                return _.keys(x.attributes);
            })));
            picarus_table = new Backbone.Table({
                collection: this.collection,
                columns: _.map(columns, function (x) {
                    if (x === 'row')
                        return {header: 'email', getFormatted: function() { return _.escape(base64.decode(this.get(x)))}}
                    return {header: decode_id(x), getFormatted: function() { return _.escape(base64.decode(this.get(x)))}};
                })
            });
            this.$el.html(picarus_table.render().el);
        }
    });
    new AppView({collection: users, el: $('#users')});
    login_get(function (email_auth) {
        var user = new PicarusUser({row: encode_id(email_auth.email)});
        users.add(user);
        user.fetch();
        
    });
}
function render_data_uploads(email_auth) {
    function success_user(xhr) {
        response = JSON.parse(xhr.responseText);

    }
    var AppView = Backbone.View.extend({
        el: $('#container'),
        initialize: function() {
            _.bindAll(this, 'render');
            this.model.bind('reset', this.render);
            this.model.bind('change', this.render);
        },
        render: function() {
            var startRow = _.unescape(this.model.pescape('upload_row_prefix'));
            var imageColumn = encode_id('thum:image_150sq');
            function success(row, columns) {
                //$('#images').append(escape(decode_id(row)));
                //$('#images').append($('<br>'));
                $('#images').append($('<img>').attr('src', 'data:image/jpeg;base64,' + columns[imageColumn]).attr('width', '150px'));
                //$('#images').append($('<br>'));
            }
            picarus_api_data_scanner("images", encode_id(startRow), encode_id(prefix_to_stop_row(startRow)), [imageColumn], {success: success, maxRows: 24});
        }
    });
    var model = new PicarusUser({row: encode_id(email_auth.email)});
    new AppView({ model: model });
    model.fetch();
    //picarus_api("/a1/data/users/" + encode_id(email_auth.email), "GET", {success: success_user});
}
function render_crawl_flickr() {
    row_selector($('#rowPrefixDrop'), $('#startRow'), $('#stopRow'));
    $('#runButton').click(function () {
        button_running();
        var demo_class = $('#democlass').val();
        var demo_query = $('#demoquery').val();
        var row_prefix = $('#rowPrefixDrop').val();
        if (demo_query.length == 0 && row_prefix.length == 0) {
            display_alert('Must specify query and prefix');
            return;
        }
        queries = _.shuffle(demo_query.split(';'));
        var iters = parseInt($('#demoiters').val())
        var simul = 10;
        if (isNaN(iters) || iters < 1 || iters > 20) {
            display_alert('Iters must be 0 < x <= 20');
            return;
        }
        $('#numRows').html('');
        /* Check input */
        //reset_state();
        var min_time = 1232170610;
        var latitude = Number($('#demolat').val());
        var longitude = Number($('#demolon').val());
        var done = 0;

        states = [];
        _.each(queries, function (query) {
            var state = {query: query, className: demo_class};
            _.each(_.range(iters), function () {states.push(state)});
        });
        states = _.shuffle(states);
        simul = Math.min(simul, states.length);
        function call_api(state) {
            var timeRadius = 60 * 60 * 24 * 30 * 3; // 3 months
            var minUploadDate = parseInt((new Date().getTime() / 1000 - min_time) * Math.random() + min_time - timeRadius);
            var maxUploadDate = parseInt(timeRadius * 2 + minUploadDate);
            var p = {hasGeo: Number($('#demogeo').is(':checked')), query: state.query, minUploadDate: minUploadDate, maxUploadDate: maxUploadDate, action: 'o/crawl/flickr'};
            if (state.className.length)
                p.className = state.className;
            if (latitude && longitude) {
                p.lat = String(latitude);
                p.lon = String(longitude);
            }
            function success(xhr) {
                var response = JSON.parse(xhr.responseText);
                function etod(e) {
                    var d = new Date(0);
                    d.setUTCSeconds(e);
                    return d.toString();
                }
                var data = {minUploadDate: etod(minUploadDate), maxUploadDate: etod(maxUploadDate), numRows: response.numRows};
                $('#numRows').append('Crawl Finished : ' + state.query + ' '+ JSON.stringify(data) + '<br>');
                if (!states.length) {
                    simul -= 1;
                    if (!simul)
                        button_reset();
                    return;
                }
                call_api(states.pop());
            }
            picarus_api("/a1/slice/images/" + encode_id(row_prefix) + '/' + encode_id(prefix_to_stop_row(row_prefix)), "POST", {success: success, data: p});
        }
        _.each(_.range(simul), function () {call_api(states.pop())});
    });
}
function render_models_list() {
    var columns = ['meta:name', 'meta:input_type', 'meta:output_type', 'row', 'meta:creation_time', 'meta:input',
                   'meta:model_link_size', 'meta:model_chain_size', 'meta:factory_info'];
    var columns_model = ['meta:'];
    results = new PicarusRows([], {'table': 'models', columns: columns_model});
    var takeoutColumn = {header: "Takeout", getFormatted: function() {
        return Mustache.render("<a class='takeout_link' row='{{row}}'>Link</a>/<a class='takeout_chain' row='{{row}}'>Chain</a>", {row: this.escape('row')});
    }};
    var tagsColumn = {header: "Tags", className: "models-tags", getFormatted: function() { return this.pescape('meta:tags') + '<span style="font-size:5px"><a class="modal_link_tags" row="' + this.escape('row') + '">edit</a></span>'}};
    var notesColumn = {header: "Notes", className: "models-notes", getFormatted: function() { return this.pescape('meta:notes') + '<span style="font-size:5px"><a class="modal_link_notes" row="' + this.escape('row') + '">edit</a></span>'}};
    function postRender() {
        function process_takeout(row, model_chunks_column, model_column, model_type) {
            function takeoutSuccess(xhr) {
                var chunks = _.map(JSON.parse(xhr.responseText), function (v, k) {
                    return [Number(decode_id(k).split('-')[1]), base64.decode(v)];
                }).sort();
                var model = _.map(chunks, function (v, k) {
                    return v[1];
                }).join('');
                var curSha1 = CryptoJS.SHA1(CryptoJS.enc.Base64.parse(base64.encode(model))).toString();
                var trueSha1 = results.get(row).pescape('meta:model_' + model_type + '_sha1');
                if (curSha1 === trueSha1) {
                    var modelByteArray = new Uint8Array(model.length);
                    for (var i = 0; i < model.length; i++) {
                        modelByteArray[i] = model.charCodeAt(i) & 0xff;
                    }
                    var blob = new Blob([modelByteArray]);
                    saveAs(blob, 'picarus-model-' + row + '.sha1-' +  trueSha1 + '.' + model_type + '.msgpack');
                } else {
                    alert("Model SHA1 doesn't match!");
                }
            }
            var num_chunks = Number(results.get(row).pescape(model_chunks_column));
            var columns = 'columns=' + _.map(_.range(num_chunks), function (x) {
                return encode_id(model_column + '-' + x);
            }).join('&');
            var url = '/a1/data/models/' + row + '?' + columns;
            picarus_api(url, "GET", {success: takeoutSuccess});
        }
        $('.takeout_link').click(function (data) {
            process_takeout($(data.target).attr('row'), 'meta:model_link_chunks', 'data:model_link', 'link');
        });
        $('.takeout_chain').click(function (data) {
            process_takeout($(data.target).attr('row'), 'meta:model_chain_chunks', 'data:model_chain', 'chain');
        });

        function setup_modal(links, col) {
            links.click(function (data) {
                var row = data.target.getAttribute('row');
                var model = results.get(row);
                $('#modal_content').val(model.pescape(col));
                $('#save_button').unbind();
                $('#save_button').click(function () {
                    var attributes = {};
                    attributes[col] = $('#modal_content').val();
                    model.psave(attributes, {patch: true});
                    $('#myModal').modal('hide');
                });
                $('#myModal').modal('show')
            })
        }
        setup_modal($('.modal_link_notes'), 'meta:notes');
        setup_modal($('.modal_link_tags'), 'meta:tags');
    }
    new RowsView({collection: results, el: $('#results'), extraColumns: [takeoutColumn, notesColumn, tagsColumn], postRender: postRender, deleteRows: true, columns: columns});
    results.fetch();
}
function render_models_create() {
    results = new PicarusRows([], {'table': 'parameters'});
    var AppView = Backbone.View.extend({
        initialize: function() {
            _.bindAll(this, 'renderKind');
            _.bindAll(this, 'renderName');
            this.collection.bind('reset', this.renderKind);
            this.collection.bind('change', this.renderKind);
            this.collection.bind('add', this.renderKind);
        },
        events: {'change #kind_select': 'renderName',
                 'change #name_select': 'renderParam'},
        renderParam: function () {
            $('#params').html('');
            $('#slices_select').html('');
            var model_kind = $('#kind_select option:selected').val();
            var name = $('#name_select option:selected').val();
            model = results.filter(function (x) {
                if (x.pescape('kind') == model_kind && x.pescape('name') == name)
                    return true;
            })[0];

            function add_param_selections(params, param_prefix) {
                _.each(params, function (value, key) {
                    var cur_el;
                    if (value.type == 'enum') {
                        var select_template = "{{#models}}<option value='{{.}}'>{{.}}</option>{{/models}};"
                        cur_el = $('<select>').attr('name', param_prefix + key).html(Mustache.render(select_template, {models: value.values}));
                    } else if (value.type == 'int') {
                        // TODO: Client-side data validation
                        cur_el = $('<input>').attr('name', param_prefix + key).attr('type', 'text').addClass('input-medium');
                    } else if (value.type == 'float') {
                        // TODO: Client-side data validation
                        cur_el = $('<input>').attr('name', param_prefix + key).attr('type', 'text').addClass('input-medium');
                    } else if (value.type == 'int_list') {
                        // Create as many input boxes as the min # of boxes
                        cur_el = $('<input>').attr('type', 'text').addClass('input-medium').val(value.min_size);
                        var box_func = function () {
                            $("[name^=" + param_prefix + key +  "]").remove();
                            _.each(_.range(Number(cur_el.val())), function (x) {
                                var cur_el_num = $('<input>').attr('name', param_prefix + key + ':' + x).attr('type', 'text').addClass('input-mini');
                                $('#params').append(cur_el_num);
                                add_hint(cur_el_num, key + ':' + x);
                            });
                        }
                        box_func();
                        cur_el.change(box_func);
                    } else if (value.type == 'str') {
                        // TODO: Client-side data validation
                        cur_el = $('<input>').attr('name', param_prefix + key).attr('type', 'text').addClass('input-medium');
                    }
                    if (typeof cur_el !== 'undefined') {
                        $('#params').append(cur_el);
                        add_hint(cur_el, key);
                    }
                });
            }
            add_param_selections(model.pescapejs('params'), 'param-');
            if (model.pescape('data') === 'slices') {
                $('#slices_select').append(document.getElementById('bpl_slices_select').innerHTML);
                slices_selector();
            }
            var inputs;
            if (model.pescape('type') == 'model')
                inputs = [model.pescape('input_type')];
            else
                inputs = model.pescapejs('input_types');
            _.each(inputs, function (value) {
                var cur_el;
                var cur_id = _.uniqueId('model_select_');          
                if (value === 'raw_image') {
                    $('#params').append($('<input>').attr('name', 'input-' + value).attr('type', 'hidden').val(encode_id('data:image')));
                } else if (value === 'meta') {
                    var cur_id = _.uniqueId('model_select_');
                    var el = $('<input>').attr('id', cur_id).attr('name', 'input-' +  value).attr('type', 'text').addClass('input-medium');
                    $('#params').append(el);
                    add_hint(el, 'Metadata column (e.g., meta:class)');
                } else {
                    $('#params').append($('<select>').attr('id', cur_id).attr('name', 'input-' + value).addClass('input-medium'));
                    model_dropdown({modelFilter: function (x) {return x.pescape('meta:output_type') === value},
                                    change: function() {},
                                    el: $('#' + cur_id)});
                }
            });
        },
        renderKind: function() {
            var select_template = "{{#models}}<option value='{{.}}'>{{.}}</option>{{/models}};"
            var models_filt = _.uniq(_.map(this.collection.models, function (data) {return data.pescape('kind')}));
            $('#kind_select').html(Mustache.render(select_template, {models: models_filt}));
            this.renderName();
        },
        renderName: function () {
            var model_kind = $('#kind_select option:selected').val();
            var cur_models = this.collection.filter(function (x) { return x.pescape('kind') == model_kind});
            var select_template = "{{#models}}<option value='{{.}}'>{{.}}</option>{{/models}};"
            var models_filt = _.map(cur_models, function (data) {return data.pescape('name')});
            $('#name_select').html(Mustache.render(select_template, {models: models_filt}));
            this.renderParam();
        }
    });
    av = new AppView({collection: results, el: $('#selects')});
    results.fetch();
    $('#runButton').click(function () {
        var params = _.object($('#params :input').map(function () {return [[$(this).attr('name'), $(this).val()]]}));
        if (!_.isUndefined(params['input-meta']))
            params['input-meta'] = encode_id(params['input-meta']);
        function success(xhr) {
            response = JSON.parse(xhr.responseText);
            $('#results').html(response.row);
        }
        var model_kind = $('#kind_select option:selected').val();
        var name = $('#name_select option:selected').val();
        var model = results.filter(function (x) {
            if (x.pescape('kind') == model_kind && x.pescape('name') == name)
                return true;
        })[0];
        var path = model.get('row');
        params.path = decode_id(path);
        if (model.pescape('type') === 'factory') {
            params.table = 'images';
            params.slices = slices_selector_get().join(',');
            p = params;
            picarus_api("/a1/data/models", "POST", {success: success, data: params});
        } else {
            picarus_api("/a1/data/models", "POST", {success: success, data: params});
        }
    });
}
function render_models_single() {
    function render_image(image_data, div, success) {
        var image_id = _.uniqueId('image_');
        var canvas_id = _.uniqueId('canvas_');
        var image_tag = $('<img>').css('visibility', 'hidden').css('display', 'none').attr('id', image_id);
        image_tag.load(function () {
            success(image_id, canvas_id);
        });
        div.append(image_tag.attr('src', image_data));
    }
    function render_image_boxes(image_data, boxes, num_boxes, div) {
        render_image(image_data, div, function (image_id, canvas_id) {
            var h = $('#' + image_id).height();
            var w = $('#' + image_id).width();
            div.append($('<canvas>').attr('id', canvas_id).attr('height', h + 'px').attr('width', w + 'px'));
            var c = document.getElementById(canvas_id);
            var ctx = c.getContext("2d");
            ctx.strokeStyle = 'blue';
            var img = document.getElementById(image_id);
            ctx.drawImage(img, 0, 0);
            _.each(_.range(num_boxes), function (x) {
                var x0 = boxes[x * 4 + 2] * w;
                var x1 = boxes[x * 4 + 3] * w;
                var y0 = boxes[x * 4] * h;
                var y1 = boxes[x * 4 + 1] * h;
                ctx.moveTo(x0, y0);ctx.lineTo(x0, y1);ctx.stroke(); // TL->BL
                ctx.moveTo(x0, y1);ctx.lineTo(x1, y1);ctx.stroke(); // BL->BR
                ctx.moveTo(x1, y1);ctx.lineTo(x1, y0);ctx.stroke(); // BR->TR
                ctx.moveTo(x1, y0);ctx.lineTo(x0, y0);ctx.stroke(); // TR->TL
            });
        });
    }
    function render_image_points(image_data, points, num_points, div) {
        render_image(image_data, div, function (image_id, canvas_id) {
            var h = $('#' + image_id).height();
            var w = $('#' + image_id).width();
            div.append($('<canvas>').attr('id', canvas_id).attr('height', h + 'px').attr('width', w + 'px'));
            var c = document.getElementById(canvas_id);
            var ctx = c.getContext("2d");
            ctx.strokeStyle = 'blue';
            var img = document.getElementById(image_id);
            ctx.drawImage(img, 0, 0);
            _.each(_.range(num_points), function (x) {
                var sz = Math.max(h, w) * points[x * 6 + 5] / 2;
                var y = points[x * 6 + 0] * h;
                var x = points[x * 6 + 1] * w;
                console.log(sz);
                ctx.beginPath();
                ctx.arc(x, y,sz,0,2*Math.PI);
                ctx.stroke();
                //ctx.fillRect(x, y, sz, sz);
                /*ctx.beginPath();
                  ctx.arc(x, y, sz / 2, 0, 2 * Math.PI, false);
                  ctx.lineWidth = 2;
                  ctx.strokeStyle = '#003300';
                  ctx.stroke();*/
            })
                });
    }
    var models = model_dropdown({modelFilter: function (x) {return true},
                                 change: function() {},
                                 el: $('#model_select')});
    function handleFileSelect(func, evt) {
        var files = evt.target.files;
        for (var i = 0, f; f = files[i]; i++) {
            if (!f.type.match('image.*'))
                continue;
            var reader = new FileReader();
            reader.onload = (function(theFile) {
                return function(e) {
                    func(e.target.result);
                };
            })(f);
            reader.readAsDataURL(f);
        }
    }
    function fileChange(evt) {
        imageData = undefined;
        handleFileSelect(function (x) {imageData = x}, evt);
        $('#imagefile').wrap('<div />');
        if ($('#imagefile')[0].files.length != 1) {
            display_alert('You must specify an image!');
            return;
        }
        var modelKey = $('#model_select').find(":selected").val();
        function success_func(xhr) {
            $('#imagefile').parent().html($('#imagefile').parent().html());
            $('#imagefile').change(fileChange);
            result = JSON.parse(xhr.responseText);
            var outputType = models.get(modelKey).pescape('meta:output_type');
            if (outputType == 'binary_class_confidence') {
                $('#results').html($('<h3>').text('Classifier Confidence'));
                $('#results').append(msgpack.unpack(base64.decode(result[modelKey])));
            } else if (outputType == 'binary_prediction') {
                $('#results').html($('<h3>').text('Binary Prediction'));
                $('#results').append(String(msgpack.unpack(base64.decode(result[modelKey]))));
            } else if (outputType == 'processed_image') {
                $('#results').html($('<h3>').text('Processed Image'));
                $('#results').append($('<img>').attr('src', 'data:image/jpeg;base64,' + result[modelKey]));
            } else if (outputType == 'image_detections') {
                $('#results').html($('<h3>').text('Detections'));
                v = msgpack.unpack(base64.decode(result[modelKey]));
                render_image_boxes(imageData, v[0], v[1][0], $('#results'));
            } else if (outputType == 'feature') {
                $('#results').html($('<h3>').text('Feature'));
                $('#results').append(_.escape(JSON.stringify(msgpack.unpack(base64.decode(result[modelKey]))[0])));
            } else if (outputType == 'multi_class_distance') {
                $('#results').html($('<h3>').text('Multi Class Distance'));
                var data = msgpack.unpack(base64.decode(result[modelKey]));
                _.each(data, function (x) {
                    $('#results').append(x[1] + ' ' + x[0] + '<br>');
                });
            } else if (outputType == 'distance_image_rows') {
                $('#results').html($('<h3>').text('Image Search Results'));
                var data = msgpack.unpack(base64.decode(result[modelKey]));
                debug_data = msgpack.unpack(base64.decode(result[modelKey]));
                _.each(data, function (x) {
                    var image_id = _.uniqueId('image_');
                    $('#results').append('<img id="' + image_id + '">' + ' ' + x[0] + '<br>');
                    imageThumbnail(x[1], image_id);
                });
            } else if (outputType == 'feature2d_binary') {
                var data = msgpack.unpack(base64.decode(result[modelKey]));
                debug_data = data;
                render_image_points(imageData, data[1], data[2][0], $('#results'));
            } else {
                debug_result = result[modelKey];
                alert('Unrecognized output type');
            }
        }
        function upload_func(xhr) {
            var response = JSON.parse(xhr.responseText);
            picarus_api_row(table, response.row, "POST", {data: {action: 'i/chain', model: modelKey}, success: success_func})
        }
        var table = 'images';
        var data = {};
        data[encode_id('data:image')] = $('#imagefile')[0].files[0];
        picarus_api_upload(table, {data: data, success: upload_func})
        $('#results').html('');
    }
    $('#imagefile').change(fileChange);
}
function render_models_slice() {
    model_dropdown({modelFilter: function (x) {return true},
                    el: $('#model_select')});
    row_selector($('#rowPrefixDrop'), $('#startRow'), $('#stopRow'));
    $('#runButton').click(function () {
        button_running();
        var startRow = encode_id(unescape($('#startRow').val()));
        var stopRow = encode_id(unescape($('#stopRow').val()));
        var action = 'io/link';
        if ($('#chainCheck').is(':checked'))
            action = 'io/chain';
        var data = {action: action, model: $('#model_select').find(":selected").val()};
        picarus_api("/a1/slice/images/" + startRow + '/' + stopRow, "POST", {success: button_reset, fail: button_error, data: data});
    });
}
function render_process_thumbnail() {
    row_selector($('#rowPrefixDrop'), $('#startRow'), $('#stopRow'));
    $('#runButton').click(function () {
        button_running();
        var startRow = encode_id($('#startRow').val());
        var stopRow = encode_id($('#stopRow').val());
        picarus_api("/a1/slice/images/" + startRow + '/' + stopRow, "POST", {success: button_reset, fail: button_error, data: {action: 'io/thumbnail'}});
    });
}
function render_process_garbage() {
    row_selector($('#rowPrefixDrop'), $('#startRow'), $('#stopRow'));
    $('#runButton').click(function () {
        button_running();
        var startRow = encode_id($('#startRow').val());
        var stopRow = encode_id($('#stopRow').val());
        function success(xhr) {
            response = JSON.parse(xhr.responseText);
            button_reset();
            _.each(response.columns, function (x) {
                $('#results').append(x + '<br>');
            });
        }
        picarus_api("/a1/slice/images/" + startRow + '/' + stopRow, "POST", {success: button_reset, fail: button_error, data: {action: 'io/garbage'}});
    });
}
function render_process_exif() {
    row_selector($('#rowPrefixDrop'), $('#startRow'), $('#stopRow'));
    $('#runButton').click(function () {
        button_running();
        var startRow = encode_id($('#startRow').val());
        var stopRow = encode_id($('#stopRow').val());
        picarus_api("/a1/slice/images/" + startRow + '/' + stopRow, "POST", {success: button_reset, fail: button_error, data: {action: 'io/exif'}});
    });
}
function render_process_modify() {
    row_selector($('#rowPrefixDrop'), $('#startRow'), $('#stopRow'));
    $('#runButton').click(function () {
        button_running();
        var columnName = encode_id($('#columnName').val());
        var columnValue = base64.encode($('#columnValue').val());
        var startRow = encode_id($('#startRow').val());
        var stopRow = encode_id($('#stopRow').val());
        var data = {};
        data[columnName] = columnValue;
        picarus_api("/a1/slice/images/" + startRow + '/' + stopRow, "PATCH", {success: button_reset, fail: button_error, data: data});
    });
}
function render_process_copy() {
    row_selector($('#rowPrefixDrop'), $('#startRow'), $('#stopRow'));
    row_selector($('#rowPrefixDrop2'));
    $('#runButton').click(function () {
        button_running();
        var imageColumn = encode_id('data:image');
        var columnName = encode_id($('#columnName').val());
        var columnValue = $('#columnValue').val();
        var startRow = encode_id($('#startRow').val());
        var stopRow = encode_id($('#stopRow').val());
        var prefix = $('#rowPrefixDrop2 option:selected').val();
        var maxRows = Number($('#maxRows').val());
        function success(row, columns) {
            // Generate row key
            var cur_row = encode_id(prefix + random_bytes(10));
            cur_data = {};
            cur_data[imageColumn] = columns[imageColumn];
            if (columnName.length)
                cur_data[columnName] = base64.encode(columnValue);
            picarus_api_row("images", cur_row, "PATCH", {data: cur_data});
        }
        // Scan through rows, each one write back to the prefix
        picarus_api_data_scanner("images", startRow, stopRow, [imageColumn], {success: success, done: button_reset, fail: button_error, maxRows: maxRows, maxRowsIter: 5});
    });
}
function render_annotate_list() {
    results = new PicarusRows([], {'table': 'annotations'});
    var workerColumn = {header: "Worker", getFormatted: function() {
        return Mustache.render("<a href='/a1/annotate/{{task}}/index.html' target='_blank'>Worker</a>", {task: this.pescape('task')});
    }};
    function postRender() {
    }
    new RowsView({collection: results, el: $('#annotations'), extraColumns: [workerColumn], postRender: postRender, deleteRows: true});
    results.fetch();
}
function render_annotate_batch() {
    row_selector($('#rowPrefixDrop'), $('#startRow'), $('#stopRow'));
    $('#runButton').click(function () {
        var startRow = encode_id($('#startRow').val());
        var stopRow = encode_id($('#stopRow').val());
        var imageColumn = encode_id('thum:image_150sq');
        var entityColumn = encode_id('meta:class');
        var numTasks = Number($('#num_tasks').val());
        var query = $('#query').val();
        function success(xhr) {
            response = JSON.parse(xhr.responseText);
            $('#results').append($('<a>').attr('href', '/a1/annotate/' + response.task + '/index.html').text('Worker').attr('target', '_blank'));
        }
        picarus_api("/a1/slice/images/" + startRow + '/' + stopRow, "POST", {success: success, data: {action: 'io/annotate/image/query_batch', imageColumn: imageColumn, query: query, instructions: $('#instructions').val(), numTasks: numTasks, mode: "amt"}});
    });
}
function render_annotate_entity() {
    row_selector($('#rowPrefixDrop'), $('#startRow'), $('#stopRow'));
    $('#runButton').click(function () {
        var startRow = encode_id($('#startRow').val());
        var stopRow = encode_id($('#stopRow').val());
        var imageColumn = encode_id('thum:image_150sq');
        var numTasks = Number($('#num_tasks').val());
        var entityColumn = encode_id($('#entity').val());
        function success(xhr) {
            response = JSON.parse(xhr.responseText);
            $('#results').append($('<a>').attr('href', '/a1/annotate/' + response.task + '/index.html').text('Worker').attr('target', '_blank'));
        }
        picarus_api("/a1/slice/images/" + startRow + '/' + stopRow, "POST", {success: success, data: {action: 'io/annotate/image/entity', imageColumn: imageColumn, entityColumn: entityColumn, instructions: $('#instructions').val(), numTasks: numTasks, mode: "amt"}});
    });
}
function render_visualize_thumbnails() {
    row_selector($('#rowPrefixDrop'), $('#startRow'), $('#stopRow'));
    $('#runButton').click(function () {
        var startRow = encode_id(unescape($('#startRow').val()));
        var stopRow = encode_id(unescape($('#stopRow').val()));
        var imageColumn = encode_id('thum:image_150sq');
        var metaCF = encode_id('meta:');
        if (startRow.length == 0 || stopRow.length == 0) {
            display_alert('Must specify rows');
            return;
        }
        $('#results').html('');
        function success(row, columns) {
            c = columns;
            if (!_.has(columns, imageColumn))
                return;
            $('#results').append($('<img>').attr('src', 'data:image/jpeg;base64,' + columns[imageColumn]).attr('title', row))
            //$('#results').append($('<br>'));
        }
        var params = {success: success, maxRows: 100};
        var filter = unescape($('#filter').val());
        if (filter.length > 0) {
            params.filter = filter;
        }
        picarus_api_data_scanner("images", startRow, stopRow, [imageColumn, metaCF], params)
    });
}
function render_visualize_metadata() {
    row_selector($('#rowPrefixDrop'), $('#startRow'), $('#stopRow'));
    $('#runButton').click(function () {
        var startRow = encode_id(unescape($('#startRow').val()));
        var stopRow = encode_id(unescape($('#stopRow').val()));
        var max_size = Number($('#maxSize').val());
        var metaCF = encode_id('meta:');
        if (startRow.length == 0 || stopRow.length == 0) {
            display_alert('Must specify rows');
            return;
        }
        button_confirm_click_reset($('#removeButton'));
        // Setup table
        images = new PicarusImages();
        function remove_rows() {
            // TODO: Since there is a maxRows setting, this won't remove all rows, just the ones we have available
            var rows = _.map(images.models, function (x) {return x.id})
            picarus_api_delete_rows(rows, progressModal());
        }
        function done() {
            $('#results').html('');
            if (!images.length)
                return;
            var AppView = Backbone.View.extend({
                initialize: function() {
                    _.bindAll(this, 'render');
                    this.collection.bind('reset', this.render);
                    this.collection.bind('change', this.render);
                    this.collection.bind('add', this.render);
                },
                render: function() {
                    var columns = _.uniq(_.flatten(_.map(this.collection.models, function (x) {
                        return _.keys(x.attributes);
                    })));
                    picarus_table = new Backbone.Table({
                        collection: this.collection,
                        columns: _.map(columns, function (v) {
                            if (v === "row")
                                return [v, v];
                            return {header: base64.decode(v), getFormatted: function() {
                                var out = this.get(v);
                                if (typeof out !== 'undefined') {
                                    out = base64.decode(out);
                                    if (out.length <= max_size)
                                        return out;
                                    else
                                        return '<span style="color:red">' + out.slice(0, max_size) + '</span>'
                                }
                            }};
                        })
                    });
                    this.$el.html(picarus_table.render().el);
                }
            });
            av = new AppView({collection: images, el: $('#results')});
            av.render();
            $('#removeButton').removeAttr('disabled');
            button_confirm_click($('#removeButton'), remove_rows);
        }
        function success(row, columns) {
            c=columns;
            columns.row = row;
            images.add(columns);
        }
        var params = {success: success, maxRows: 1000, done: done};
        var filter = unescape($('#filter').val());
        if (filter.length > 0) {
            params.filter = filter;
        }
        picarus_api_data_scanner("images", startRow, stopRow, [metaCF], params)
    });
}
function render_visualize_exif() {
    row_selector($('#rowPrefixDrop'), $('#startRow'), $('#stopRow'));
    // TODO: Fix for exif
    $('#runButton').click(function () {
        var startRow = encode_id(unescape($('#startRow').val()));
        var stopRow = encode_id(unescape($('#stopRow').val()));
        var max_size = Number($('#maxSize').val());
        var metaCF = encode_id('meta:');
        if (startRow.length == 0 || stopRow.length == 0) {
            display_alert('Must specify rows');
            return;
        }
        button_confirm_click_reset($('#removeButton'));
        // Setup table
        images = new PicarusImages();
        var exif_column = encode_id('meta:exif');
        function remove_rows() {
            // TODO: Since there is a maxRows setting, this won't remove all rows, just the ones we have available
            var rows = _.map(images.models, function (x) {return x.id})
            picarus_api_delete_rows(rows, progressModal());
        }
        function done() {
            $('#results').html('');
            if (!images.length)
                return;
            var AppView = Backbone.View.extend({
                initialize: function() {
                    _.bindAll(this, 'render');
                    this.collection.bind('reset', this.render);
                    this.collection.bind('change', this.render);
                    this.collection.bind('add', this.render);
                },
                render: function() {
                    var cur_images = this.collection.filter(function (x) {return x.get(exif_column) != 'e30=' && !_.isUndefined(x.get(exif_column))});
                    columns = _.uniq(_.flatten(_.map(cur_images, function (x) {
                        return _.keys(JSON.parse(base64.decode(x.get(exif_column))));
                    }))).concat(['row']);
                    picarus_table = new Backbone.Table({
                        collection: this.collection,
                        columns: _.map(columns, function (v) {
                            if (v === "row")
                                return [v, v];
                            return {header: v, getFormatted: function() {
                                var cur_exif = JSON.parse(base64.decode(this.get(exif_column)));
                                var out = cur_exif[v];
                                if (typeof out !== 'undefined') {
                                    if (!_.isString(out))
                                        return _.escape(JSON.stringify(out));
                                    out = base64.decode(out);
                                    if (typeof out.length <= max_size)
                                        return _.escape(out);
                                    else
                                        return '<span style="color:red">' + _.escape(out.slice(0, max_size)) + '</span>'
                                }
                            }};
                        })
                    });
                    this.$el.html(picarus_table.render().el);
                }
            });
            av = new AppView({collection: images, el: $('#results')});
            av.render();
            $('#removeButton').removeAttr('disabled');
            button_confirm_click($('#removeButton'), remove_rows);
        }
        function success(row, columns) {
            c=columns;
            columns.row = row;
            if (columns[exif_column] != 'e30=')
                images.add(columns);
        }
        var params = {success: success, maxRows: 1000, done: done};
        var filter = unescape($('#filter').val());
        if (filter.length > 0) {
            params.filter = filter;
        }
        picarus_api_data_scanner("images", startRow, stopRow, [metaCF], params)
    });
}
function render_visualize_locations() {
    row_selector($('#rowPrefixDrop'), $('#startRow'), $('#stopRow'));
    function deg2rad(deg) {
        return deg * (Math.PI/180)
    }
    function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
        // From: http://stackoverflow.com/questions/27928/how-do-i-calculate-distance-between-two-latitude-longitude-points
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2-lat1);
        var dLon = deg2rad(lon2-lon1); 
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var d = R * c; // Distance in km
        return d;
    }
    function filter_lat_long(lat, lon) {
        var targetLat = Number($('#demolat').val());
        var targetLong = Number($('#demolong').val());
        var targetDist = Number($('#demodist').val());
        var checked = $('#filterInvert').is(':checked');
        if (!targetLat || !targetLong)
            return checked;
        if (getDistanceFromLatLonInKm(targetLat, targetLong, lat, lon) > targetDist)
            return !checked;
        return checked;
    }
    $('#runButton').click(function () {
        var latitude = encode_id('meta:latitude');
        var longitude = encode_id('meta:longitude');
        button_confirm_click_reset($('#removeButton'));
        images = new PicarusImages();
        function maps_success(row, columns) {
            columns.row = row;
            var curLat = base64.decode(columns[latitude]);
            var curLong = base64.decode(columns[longitude]);
            if (filter_lat_long(Number(curLat), Number(curLong))) {
                return;
            }
            images.add(new PicarusImage(columns));
        }
        function maps_done() {
            var centerLat = Number($('#demolat').val());
            var centerLong = Number($('#demolong').val());
            button_confirm_click($('#removeButton'), function () {
                var rows = _.map(images.models, function (x) {return x.get('row')});
                picarus_api_delete_rows(rows, progressModal());
            });
            $('#removeButton').removeAttr('disabled');
            if (!centerLat || !centerLat) {
                centerLat = Number(base64.decode(images.at(0).get(latitude)));
                centerLong = Number(base64.decode(images.at(0).get(longitude)));
            }
            var mapOptions = {
                zoom: 14,
                center: new google.maps.LatLng(centerLat, centerLong),
                mapTypeId: google.maps.MapTypeId.HYBRID
            };
            map = new google.maps.Map(document.getElementById("map_canvas"),
                                      mapOptions);
            google.maps.event.addListener(map, 'rightclick', function(event){
                $('#demolat').val(event.latLng.lat());
                $('#demolong').val(event.latLng.lng());
            });
            images.each(function (x) {
                var lat = Number(base64.decode(x.get(latitude)));
                var log = Number(base64.decode(x.get(longitude)));
                new google.maps.Marker({position: new google.maps.LatLng(lat, lon), map: map});
            });
        }
        picarus_api_data_scanner("images", encode_id(unescape($('#startRow').val())), encode_id(unescape($('#stopRow').val())), [latitude, longitude], {success: maps_success, done: maps_done});
    })
}
function render_visualize_times() {
    row_selector($('#rowPrefixDrop'), $('#startRow'), $('#stopRow'));
    function drawYears(hist) {
        var data = google.visualization.arrayToDataTable([['Year', 'Count']].concat(hist));
        new google.visualization.ColumnChart(document.getElementById('histYear')).draw(data, {title:"Histogram (Year)", width:600, height:400, vAxis: {title: "Count"}, hAxis: {title: "Year"}});
    }
    function drawMonths(hist) {
        var data = google.visualization.arrayToDataTable([['Month', 'Count']].concat(hist));
        new google.visualization.ColumnChart(document.getElementById('histMonth')).draw(data, {title:"Histogram (Month)", width:600, height:400, vAxis: {title: "Count"}, hAxis: {title: "Month"}});
    }
    function drawHours(hist) {
        var data = google.visualization.arrayToDataTable([['Hour', 'Count']].concat(hist));
        new google.visualization.ColumnChart(document.getElementById('histHour')).draw(data, {title:"Histogram (Hour)", width:600, height:400, vAxis: {title: "Count"}, hAxis: {title: "Hour"}});
    }
    function drawDays(hist) {
        var data = google.visualization.arrayToDataTable([['Day', 'Count']].concat(hist));
        new google.visualization.ColumnChart(document.getElementById('histDay')).draw(data, {title:"Histogram (Day)", width:600, height:400, vAxis: {title: "Count"}, hAxis: {title: "Day"}});
    }
    function dataToHist(data) {
        var hist = {};
        _.each(data, function (x) {
            var y = 0;
            if (_.has(hist, x)) {
                y = hist[x];
            }
            hist[x] = y + 1;
        });
        return hist;
    }
    function dataToListHist(data) {
        return _.map(_.pairs(dataToHist(data)), function (x) {return [Number(x[0]), x[1]]}).sort();
    }
    $('#runButton').click(function () {
        var timeColumn = encode_id('meta:dateupload');
        images = new PicarusImages();
        function time_success(row, columns) {
            columns.row = row;
            images.add(new PicarusImage(columns));
        }
        function time_done() {
            years = [];
            months = [];
            hours = [];
            days = [];
            // TODO: FInish visual
            images.each(function (x) {
                var curTime = Number(base64.decode(x.get(timeColumn)));
                var curDate = new Date(0);
                curDate.setUTCSeconds(curTime);
                years.push(curDate.getFullYear());
                months.push(curDate.getMonth());
                hours.push(curDate.getHours());
                days.push(curDate.getDay());
            });
            drawYears(dataToListHist(years));
            drawMonths(dataToListHist(months));
            drawHours(dataToListHist(hours));
            drawDays(dataToListHist(days));
        }
        picarus_api_data_scanner("images", encode_id(unescape($('#startRow').val())), encode_id(unescape($('#stopRow').val())), [timeColumn], {success: time_success, done: time_done});
    })
}
function render_visualize_annotations() {
    var rows = new PicarusRows([], {'table': 'annotations'});
    function collect_users(users, results, onlyWorkers, onlyAnnotated) {
        var users_filtered = {};
        users.each(function(x) {
            if (x.pescape('workerId') || !onlyWorkers)
                users_filtered[x.get('row')] = [];
        });
        // TODO: Change mturk to put user id in results table UB64, just remove encode_id below
        results.each(function (x) {
            var i = encode_id(x.pescape('user_id'));
            if (_.has(users_filtered, i) && (!onlyAnnotated || x.pescape('end_time'))) {
                users_filtered[i].push(x);
            }
        });
        _.each(users_filtered, function (x) {
            x.sort(function (a, b) {
                a = Number(a.pescape('start_time'));
                b = Number(b.pescape('start_time'));
                if (a < b)
                    return -1;
                if (a > b)
                    return 1;
                return 0;
            });
        });
        return users_filtered;
    }
    function accumulate(hist, vals, inc) {
        _.each(vals, function (x) {
            if (_.has(hist, x))
                hist[x] += inc;
            else
                hist[x] = inc;
        });
    }
    function score_total(scoresPos, scoresNeg, scoresTotal) {
        if (_.isUndefined(scoresTotal))
            scoresTotal = {};
        _.each(scoresPos, function (y, x) {
            if (_.has(scoresTotal, x))
                scoresTotal[x] += y;
            else
                scoresTotal[x] = y;
        });
        _.each(scoresNeg, function (y, x) {
            if (_.has(scoresTotal, x))
                scoresTotal[x] += y;
            else
                scoresTotal[x] = y;
        });
        return scoresTotal;
    }
    function image_batch_score(users, results, unused_class_name, scoreUnselected) {
        // Only count explicit marks
        scoresPos = {};
        scoresNeg = {};
        scoresTotal = {};

        pick = function (s, l) { return _.map(s, function (x) {return l[x]});}

        results.each(function (x) {
            d = x.pescapejs('user_data');
            images = x.pescapejs('images');
            accumulate(scoresTotal, images, 0);  // Makes each image show up, even if not annotated
            if (_.isUndefined(d))
                return;
            if (d.polarity)
                accumulate(scoresPos, pick(d.selected, images), 1);
            if (scoreUnselected)
                accumulate(scoresNeg, pick(d.notSelected, images), 1);
            else
                accumulate(scoresNeg, pick(d.selected, images), 1);
            if (scoreUnselected)
                accumulate(scoresPos, pick(d.notSelected, images), 1);
        });
        _.each(scoresPos, function (y, x) {
            if (_.has(scoresTotal, x))
                scoresTotal[x] += y;
            else
                scoresTotal[x] = y;
        });
        _.each(scoresNeg, function (y, x) {
            if (_.has(scoresTotal, x))
                scoresTotal[x] += y;
            else
                scoresTotal[x] = y;
        });
        return {scoresPos: scoresPos, scoresNeg: scoresNeg, scoresTotal: score_total(scoresPos, scoresNeg, scoresTotal)};
    }
    function image_entity_score(users, results) {
        // Only count explicit marks
        var scores = {};

        results.each(function (x) {
            var annotation = x.pescapejs('user_data');
            var image = x.pescape('image');
            var entity = x.pescape('entity');
            if (!_.has(scores, entity)) {
                scores[entity] = {scoresPos: {}, scoresNeg: {}, scoresTotal: {}};
            }
            var scoresPos = scores[entity].scoresPos;
            var scoresNeg = scores[entity].scoresNeg;
            var scoresTotal = scores[entity].scoresTotal;
            if (_.has(scoresTotal, image))
                scoresTotal[image] += 1;
            else
                scoresTotal[image] = 1;
            if (annotation == 'true') {
                if (_.has(scoresPos, image))
                    scoresPos[image] += 1;
                else
                    scoresPos[image] = 1;
            }
            if (annotation == 'false') {
                if (_.has(scoresNeg, image))
                    scoresNeg[image] += 1;
                else
                    scoresNeg[image] = 1;
            }
        });
        return scores;
    }
    function display_annotation_task(task, get_classes, get_scores) {
        var task_dec = decode_id(task);
        /* TODO: Compute a dropdown list of available classes (new view for results model) */
        results = new PicarusRows([], {'table': 'annotations-results-' + task_dec});
        users = new PicarusRows([], {'table': 'annotations-users-' + task_dec});
        var imageColumn = encode_id('thum:image_150sq');
        $('#negPct').change(data_change);
        $('#posPct').change(data_change);
        $('#posCnt').change(data_change);
        $('#negCnt').change(data_change);
        $('#unclicked').change(data_change);
        function data_change() {
            var unclicked = $('#unclicked').is(':checked')
            var classes = get_classes(results);
            var select_template = "{{#classes}}<option value='{{.}}'>{{.}}</option>{{/classes}};"
            $('#class_select').html(Mustache.render(select_template, {classes: classes}));
            $('#class_select').unbind();
            $('#class_select').change(class_select_change);
            class_scores = get_scores(users, results, unclicked);
            class_select_change();
            var scores = _.map(class_scores, function (s, class_name) {
                var out = {pos: 0, neg: 0, total: 0, unique: _.size(s.scoresTotal)};
                _.each(s.scoresPos, function (x) {
                    out.pos += x;
                });
                _.each(s.scoresNeg, function (x) {
                    out.neg += x;
                });
                _.each(s.scoresTotal, function (x) {
                    out.total += x;
                });
                out.quality = (out.pos - out.neg) / (out.total + .0000001);
                out.class_name = class_name;
                return out;
            });
            // Update class annotations table
            scores.sort(function (x, y) {return y.quality - x.quality})
            var scores_template = "<table><tr><td>Name</td><td>Pos Annot.</td><td>Neg Annot.</td><td>Tot Annot.</td><td>Unique</td></tr>{{#scores}}<tr><td>{{class_name}}</td><td>{{pos}}</td><td>{{neg}}</td><td>{{total}}</td><td>{{unique}}</td></tr>{{/scores}}</table>";
            $('#annotation-stats').html(Mustache.render(scores_template, {scores: scores}));
            // Update user annotation time vs iteration
            var user_annotations = collect_users(users, results, true, true);
            annotation_times = {};
            _.each(user_annotations, function (z) {
                _.each(z, function(x, y) {
                    var t = Number(x.pescape('end_time')) - Number(x.pescape('start_time'));
                    if (_.has(annotation_times, y))
                        annotation_times[y].push(t)
                    else
                        annotation_times[y] = [t];
                });
            });
            var mean = function (x) { return _.reduce(x, function(memo, num){ return memo + num; }, 0) / x.length};
            median_rows = _.map(annotation_times, function (x, y) {
                x.sort(function (x, y) {return x - y});
                return [Number(y), _.min(x), x[Math.round(x.length / 2)], mean(x)]
            });
            var data0 = to_google_data(median_rows, ['Iteration', 'Min', 'Median', 'Mean']);
            var options = {title: 'Annotation Time vs Iteration #',
                           hAxis: {title: 'Iteration'}};
            var chart0 = new google.visualization.LineChart(document.getElementById('annotator_time_graph'));
            chart0.draw(data0, options);
        }
        function class_select_change() {
            var class_name = $('#class_select').find(":selected").val();
            negPct = Number($('#negPct').val());
            posPct = Number($('#posPct').val());
            negCnt = Math.max(1, Number($('#negCnt').val()));
            posCnt = Math.max(1, Number($('#posCnt').val()));
            unclicked = $('#unclicked').is(':checked');
            scores = class_scores[class_name];
            if (_.isUndefined(scores))
                return;
            ts = scores.scoresTotal;
            posScores = _.sortBy(_.filter(_.pairs(scores.scoresPos), function (x) {return x[1] >= posCnt && (x[1] / ts[x[0]]) >= posPct}), function (x) { return -x[1] });
            negScores = _.sortBy(_.filter(_.pairs(scores.scoresNeg), function (x) {return x[1] >= negCnt && (x[1] / ts[x[0]]) >= negPct}), function (x) { return x[1] });
            os = _.omit(_.omit(ts, _.keys(scores.scoresPos)), _.keys(scores.scoresNeg));
            otherScores = _.shuffle(_.pairs(os));
            function display_samples(div, scores, title) {
                div.html('');
                div.append($('<h3>').text(title + ' ' + scores.length + ' / ' + _.size(ts)));
                
                _.each(scores.slice(0, 24), function (x) {
                    var id = _.uniqueId('image_');
                    div.append($('<img>').attr('id', id).attr('title', 'Row: ' + x[0] + ' Score: ' + x[1]).addClass('hide'));
                    function success(xhr) {
                        response = JSON.parse(xhr.responseText);
                        if (_.isUndefined(response[imageColumn]))
                            return;
                        $('#' + id).attr('src', 'data:image/jpeg;base64,' + response[imageColumn]).attr('width', '150px').removeClass('hide');
                    }
                    picarus_api("/a1/data/images/" + x[0], "GET", {success: success, data: {columns: imageColumn}});
                });
            }
            display_samples($('#positive_samples'), posScores, 'Positive Samples');
            display_samples($('#negative_samples'), negScores, 'Negative Samples');
            display_samples($('#other_samples'), otherScores, 'Other Samples (not pos/neg)');
            
            // Hookup delete
            function delete_row() {
                action = $('#actionSplit').find(":selected").val();
                delKeys = _.keys(_.object({'positive': posScores, 'negative': negScores, 'other': otherScores}[action]));
                picarus_api_delete_rows(delKeys, progressModal());
                button_confirm_click_reset($('#removeButton'));
                button_confirm_click($('#removeButton'), delete_row);
            }
            button_confirm_click($('#removeButton'), delete_row);
            // Hookup modify
            function modify_row() {
                var action = $('#actionSplit').find(":selected").val();
                var modifyKeys = _.keys(_.object({'positive': posScores, 'negative': negScores, 'other': otherScores}[action]));
                picarus_api_modify_rows(modifyKeys, $('#colName').val(), $('#colValue').val(), progressModal());
                button_confirm_click_reset($('#modifyButton'));
                button_confirm_click($('#modifyButton'), modify_row);
            }
            button_confirm_click($('#modifyButton'), modify_row);
            $('#actionSplit').change(change_actions);
            function change_actions () {
                button_confirm_click_reset($('#removeButton'));
                button_confirm_click($('#removeButton'), delete_row);
                button_confirm_click_reset($('#modifyButton'));
                button_confirm_click($('#modifyButton'), modify_row);
            }
        }

        new RowsView({collection: results, el: $('#annotation-results'), postRender: _.debounce(data_change, 100)});
        results.fetch();
        
        new RowsView({collection: users, el: $('#annotation-users'), postRender: _.debounce(data_change, 100)});
        users.fetch();
    }
    function change() {
        var task = $('#annotator_select').find(":selected").val();
        if (_.isUndefined(task)) {
            return;
        }
        function success_annotation(xhr) {
            annotation = JSON.parse(xhr.responseText);
            annotation_type = JSON.parse(base64.decode(annotation[encode_id('params')])).type;
            // Code is over nested, use partial application to flatten it
            if (annotation_type == 'image_entity') {
                get_classes = function (results) {
                    return _.unique(results.map(function (x, y) {return x.pescape('entity')})).sort()
                }
                get_scores = image_entity_score;
                // TODO: Add function to get scores from results given a class
            } else if (annotation_type == 'image_query_batch') {
                
            } else {
                
            }
            display_annotation_task(task, get_classes, get_scores);
        }
        // TODO: Add dropdown to select annotator to query
        // TODO: Histogram of annotation times, annotation time vs annotation iteration (scatter and median), histogram of image annotations
        // TODO: Abstract functions for getting image annotations based on annotation type
        // TODO: Filter rows and/or modify column based on annotation
        // TODO: Add voting rules for neg/pos/unsure
        // TODO: Add other annotation types
        picarus_api("/a1/data/annotations/" + task, "GET", {success: success_annotation});
    }
    rows_dropdown(rows, {el: $('#annotator_select'), text: function (x) {return x.pescapejs('params').query}, change: change});
    rows.fetch();
}
function render_evaluate_classifier() {
    model_dropdown({modelFilter: function (x) {return x.pescape('meta:output_type') === 'binary_class_confidence'},
                    change: function() {
                        var row = this.$el.find(":selected").val();
                        m = this.collection.get(row);
                        $('#gtColumn').val(m.pescapejs('meta:factory_info').inputs.meta);
                        $('#posClass').val(m.pescapejs('meta:factory_info').params.class_positive);
                        $('#modelKey').val(row);
                    },
                    el: $('#model_select')});
    slices_selector();
    $('#runButton').click(function () {
        button_running();
        confs = {pos_confs: [], neg_confs: []};
        var gt_column = $('#gtColumn').val();
        var conf_column = $('#modelKey').val();
        var posClass = $('#posClass').val();
        
        sliceStats = {}; // [startRow/stopRow] = {# pos, # neg, # noconf, #nometa, #noconfmeta}
        var slices = slices_selector_get(true);
        _.each(slices, function (start_stop_row, index) {
            var curSlice = start_stop_row.join('/');
            sliceStats[curSlice] = {'numPos': 0, 'numNeg': 0, 'noConf': 0, 'noGT': 0, 'noConfGT': 0};
            function success(row, columns) {
                $('#progress').css('width', (100 * (confs.pos_confs.length + confs.neg_confs.length) / 19850.) + '%')
                c = columns;
                if (_.has(columns, conf_column) && _.has(columns, gt_column)) {
                    if (base64.decode(columns[gt_column]) == posClass) {
                        sliceStats[curSlice].numPos += 1;
                        confs.pos_confs.push(msgpack.unpack(base64.decode(columns[conf_column])));
                    } else {
                        sliceStats[curSlice].numNeg += 1;
                        confs.neg_confs.push(msgpack.unpack(base64.decode(columns[conf_column])));
                    }
                } else {
                    if (!_.has(columns, conf_column))
                        sliceStats[curSlice].noConf += 1;
                    if (!_.has(columns, gt_column))
                        sliceStats[curSlice].noConfGT += 1;
                    if (!_.has(columns, gt_column))
                        sliceStats[curSlice].noGT += 1;
                }
            }
            var success_confs;
            if (index == (slices.length - 1))
                success_confs = function () {
                    confs.neg_confs.sort(function(a, b) {return a - b});
                    confs.pos_confs.sort(function(a, b) {return a - b});
                    plot_confs(confs);
                    render_slice_stats_table($('#slicesTable'), sliceStats);
                    button_reset();
                }
            else
                success_confs = function () {}
            picarus_api_data_scanner("images", start_stop_row[0], start_stop_row[1], [gt_column, conf_column], {success: success, done: success_confs});
        });
    })
}
function render_slice_stats_table(table, sliceStats) {
    //sliceStats[curSlice] = {'numPos': 0, 'numNeg': 0, 'noConf': 0, 'noGT': 0, 'noConfGT': 0};
    var select_template = "<table>{{#slices}}<tr><td>{{name}}</td><td>{{numPos}}</td><td>{{numNeg}}</td><td>{{noConf}}</td><td>{{noGT}}</td><td>{{noConfGT}}</td></tr>{{/slices}}</table>"
    function convert_name(k) {
        return _.map(k.split('/'), function (x) {
            return decode_id(x);
        }).join('/');
    }
    var slices = [{name: 'Slice', numPos: 'Pos', numNeg: 'Neg', noConf: 'No Conf', noGT: 'No GT', noConfGT: 'No ConfGT'}];
    slices = slices.concat(_.map(sliceStats, function (v, k) {v.name = convert_name(k); return v}));
    table.html(Mustache.render(select_template, {slices: slices}));
}
function confs_to_conf_hist(pos_confs, neg_confs, bins, normalize) {
    /* Takes in confs, produces a histogram capturing both pos/neg confs in each bin
       TODO: Check that each bin gets get an equal portion of the range
    */
    var min_conf = Math.min(pos_confs[0], neg_confs[0]);
    var max_conf = Math.min(pos_confs[pos_confs.length - 1], neg_confs[neg_confs.length - 1]);
    var shift = min_conf;
    var scale = bins / (max_conf - min_conf);
    var pos_buckets = [];
    var neg_buckets = [];
    var coords = [];
    var i, cur_bucket;
    for (i = 0; i < bins; i++) {
        pos_buckets[i] = 0;
        neg_buckets[i] = 0;
    }
    for (i = 0; i < pos_confs.length; i++) {
        pos_buckets[Math.min(bins - 1, Math.max(0, Math.floor((pos_confs[i] - shift) * scale)))] += 1;
    }
    for (i = 0; i < neg_confs.length; i++) {
        neg_buckets[Math.min(bins - 1, Math.max(0, Math.floor((neg_confs[i] - shift) * scale)))] += 1;
    }
    for (i = 0; i < bins; i++) {
        coords[i] = [(i + .5) / scale + shift, pos_buckets[i], neg_buckets[i]];
        if (normalize) {
            coords[i][1] /= pos_confs.length;
            coords[i][2] /= neg_confs.length;
        }
    }
    return coords;
}
function test_confs_to_confusion_matrix() {
    //var cms;
    cms = confs_to_confusion_matrix([], []);
    if (!_.isEqual(cms, []))
        return 1;
    
    cms = confs_to_confusion_matrix([0], []);
    if (!_.isEqual(cms, [[1, 0, 0, 0, 0]]))
        return 2;
    
    cms = confs_to_confusion_matrix([], [0]);
    if (!_.isEqual(cms, [[0, 0, 1, 0, Infinity]]))
        return 3;
    
    cms = confs_to_confusion_matrix([0], [0]);
    if (!_.isEqual(cms, [[1, 1, 0, 0, 0], [0, 0, 1, 1, Infinity]]))
        return 4;
    
    cms = confs_to_confusion_matrix([1], [0]);
    if (!_.isEqual(cms, [[1, 0, 1, 0, 1]]))
        return 5;
    
    cms = confs_to_confusion_matrix([0], [1]);
    if (!_.isEqual(cms, [[1, 1, 0, 0, 0], [0, 0, 1, 1, Infinity]]))
        return 6;
    
    cms = confs_to_confusion_matrix([0, 0], [0]);
    if (!_.isEqual(cms, [[2, 1, 0, 0, 0], [0, 0, 1, 2, Infinity]]))
        return 7;
    
    cms = confs_to_confusion_matrix([0, 1], [0]);
    if (!_.isEqual(cms, [[2, 1, 0, 0, 0], [1, 0, 1, 1, 1]]))
        return 8;
    
    cms = confs_to_confusion_matrix([0, 0], [1]);
    if (!_.isEqual(cms, [[2, 1, 0, 0, 0], [0, 0, 1, 2, Infinity]]))
        return 9;
    
    cms = confs_to_confusion_matrix([1, 2], [0]);
    if (!_.isEqual(cms, [[2, 0, 1, 0, 1]]))
        return 10;
    
    cms = confs_to_confusion_matrix([0, 2], [1]);
    if (!_.isEqual(cms, [[2, 1, 0, 0, 0], [1, 0, 1, 1, 2]]))
        return 11;
    
    cms = confs_to_confusion_matrix([0, 1], [2]);
    if (!_.isEqual(cms, [[2, 1, 0, 0, 0], [0, 0, 1, 2, Infinity]]))
        return 12;
    
    cms = confs_to_confusion_matrix([1, 2], [0, 3]);
    if (!_.isEqual(cms, [[2, 1, 1, 0, 1], [0, 0, 2, 2, Infinity]]))
        return 13;
    
    cms = confs_to_confusion_matrix([1, 2, 3], [0, 3]);
    if (!_.isEqual(cms, [[3, 1, 1, 0, 1], [0, 0, 2, 3, Infinity]]))
        return 14;
    
    cms = confs_to_confusion_matrix([1, 2, 3, 3], [0, 3]);
    if (!_.isEqual(cms, [[4, 1, 1, 0, 1], [0, 0, 2, 4, Infinity]]))
        return 15;
    return 0;
}
function confs_to_confusion_matrix(pos_confs, neg_confs) {
    /* Takes in confs, produces list of [tp, fp, tn, fn, thresh] */
    var cm_threshs = [];
    var fn = 0;
    var tn = 0;
    var i;
    var cur_thresh;
    while (pos_confs.length || neg_confs.length) {
        // Skip Negatives
        for (i = 0; i < neg_confs.length; i++) {
            if (neg_confs[i] >= pos_confs[0]) {
                break;
            }
        }
        neg_confs = neg_confs.slice(i, neg_confs.length);
        tn += i;
        // Add PR point (cur_thresh = pos_confs[0])
        if (pos_confs.length) {
            cur_thresh = pos_confs[0];
        } else {
            cur_thresh = Infinity;
        }
        cm_threshs.push([pos_confs.length, neg_confs.length, tn, fn, cur_thresh]);
        // Skip Positives
        for (i = 0; i < pos_confs.length; i++) {
            if (pos_confs[i] > neg_confs[0]) {
                break;
            }
        }
        pos_confs = pos_confs.slice(i, pos_confs.length);
        fn += i;
    }
    return cm_threshs;
}
function cms_to_rps(cms) {
    var rps = [];
    var i;
    for (i = 0; i < cms.length; i++) {
        rps.push([cms[i][0] / (cms[i][0] + cms[i][3]), cms[i][0] / (cms[i][0] + cms[i][1]), cms[i][4]])
    }
    return rps;
}
function cms_to_conf_accs(cms) {
    var conf_accs = [];
    var i;
    for (i = 0; i < cms.length; i++) {
        conf_accs.push([cms[i][4], (cms[i][0] + cms[i][2]) / (cms[i][0] + cms[i][1] + cms[i][2] + cms[i][3])])
    }
    return conf_accs;
}
function cms_to_fpr_tprs(cms) {
    var fpr_tprs = [];
    var i, fpr, tpr;
    var p = confs.pos_confs.length;
    var n = confs.neg_confs.length;
    for (i = 0; i < cms.length; i++) {
        fpr = cms[i][1] / n; // FP / N
        tpr = cms[i][0] / p; // TP / P
        fpr_tprs.push([fpr, tpr, cms[i][4]]);
    }
    return fpr_tprs;
}
function to_google_data(pts, labels, tooltip) {
    var i;
    var data = new google.visualization.DataTable();
    for (i = 0; i < labels.length; i++) {
        data.addColumn('number', labels[i]);
    }
    if (tooltip) {
        data.addColumn({type: 'number', role: 'tooltip'});
    }
    d = pts;
    data.addRows(pts);
    return data;
}
function plot_confs(confs) {
    var test_out = test_confs_to_confusion_matrix();
    if (test_out)
        alert(test_out);
    var data0 = to_google_data(confs_to_conf_hist(confs.pos_confs, confs.neg_confs, 100), ['Confidence', '+', '-']);
    var options = {title: 'Classifier Confidence',
                   hAxis: {title: 'Confidence'}};
    var chart0 = new google.visualization.LineChart(document.getElementById('graph_confidence_scatter'));
    chart0.draw(data0, options);
    
    var data1 = to_google_data(confs_to_conf_hist(confs.pos_confs, confs.neg_confs, 100, true), ['Confidence', '+', '-']);
    options = {title: 'Classifier Confidence (normalized)',
               hAxis: {title: 'Confidence'}};
    var chart1 = new google.visualization.LineChart(document.getElementById('graph_confidence_scatter_norm'));
    chart1.draw(data1, options);
    
    // PR Curve
    var cms = confs_to_confusion_matrix(confs.pos_confs, confs.neg_confs);
    // Confidence accuracy
    var data4 = to_google_data(cms_to_conf_accs(cms), ['Confidence', 'Accuracy']);
    options = {title: 'Classifier Confidence vs Accuracy',
               hAxis: {title: 'Confidence'}};
    var chart4 = new google.visualization.LineChart(document.getElementById('graph_confidence_accuracy'));
    chart4.draw(data4, options);
    var data2 = to_google_data(cms_to_rps(cms), ['recall', 'precision'], true);
    options = {title: 'PR Curve',
               hAxis: {title: 'Recall', minValue: 0, maxValue: 1},
               vAxis: {title: 'Precision', minValue: 0, maxValue: 1},
               chartArea: {width: 200, height: 200},
               legend: {position: 'none'}};
    var chart2 = new google.visualization.LineChart(document.getElementById('graph_rps'));
    chart2.draw(data2, options);
    
    var data3 = to_google_data(cms_to_fpr_tprs(cms), ['fpr', 'tpr'], true);
    options = {title: 'ROC Curve',
               hAxis: {title: 'FPR', minValue: 0, maxValue: 1},
               vAxis: {title: 'TPR', minValue: 0, maxValue: 1},
               chartArea: {width: 200, height: 200},
               legend: {position: 'none'}};
    var chart3 = new google.visualization.LineChart(document.getElementById('graph_roc'));
    chart3.draw(data3, options);
    
    
    // This connects all the charts together
    function setNearest(chart, data, column, select_columns, val) {
        var i, minVal = Infinity, minIndex, curVal;
        for (i = 0; i < data.getNumberOfRows(); i++) {
            curVal = Math.abs(val - data.getValue(i, column));
            if (curVal < minVal) {
                minVal = curVal;
                minIndex = i;
            }
        }
        
        chart.setSelection(_.map(select_columns, function (col) {return {row: minIndex, column: col}}));
    }
    function setSelections(thresh) {
        setNearest(chart0, data0, 0, [1, 2], thresh);
        setNearest(chart1, data1, 0, [1, 2], thresh);
        setNearest(chart2, data2, 2, [1], thresh);
        setNearest(chart3, data3, 2, [1], thresh);
        setNearest(chart4, data4, 0, [1], thresh);
    }
    var al = google.visualization.events.addListener;
    al(chart0, 'select', function () {var sel = chart0.getSelection(); if (sel[0] !== undefined) setSelections(data0.getValue(sel[0].row, 0))});
    al(chart1, 'select', function () {var sel = chart1.getSelection(); if (sel[0] !== undefined) setSelections(data1.getValue(sel[0].row, 0))});
    al(chart2, 'select', function () {var sel = chart2.getSelection(); if (sel[0] !== undefined) setSelections(data2.getValue(sel[0].row, 2))});
    al(chart3, 'select', function () {var sel = chart3.getSelection(); if (sel[0] !== undefined) setSelections(data3.getValue(sel[0].row, 2))});
    al(chart4, 'select', function () {var sel = chart4.getSelection(); if (sel[0] !== undefined) setSelections(data4.getValue(sel[0].row, 0))});
}