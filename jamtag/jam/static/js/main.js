window.pendvisor = window.pendvisor || {};

require.config({
    paths: {
        jquery:	'https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min',
        pjax: 'libs/jquery.pjax',
        canjs: 'libs/can.jquery.min',
        noty: 'libs/noty/jquery.noty',
        notyLayout: 'libs/noty/layouts/bottomLeft',
        notyTheme: 'libs/noty/themes/default'
    },
    shim: {
        'pjax':["jquery"],
        'canjs':["jquery"],
        'noty':["jquery"],
        'notyLayout':["noty"],
        'notyTheme':["noty"]
    }
});

require(["jquery", "pjax", "canjs", 'noty', 'notyLayout', 'notyTheme'], function($) {
    $(function() {
        // unity
        try{
            var unity = external.getUnityObject(1.0);
            unity.init({
                name: "Pendvisor",
                iconUrl: "icon://Pendvisor",
                onInit: null
            });
        }
        catch(e){
            console.log(e);
        }
        // noty setup
        $.noty.defaults.layout = 'bottomLeft';
        $.noty.defaults.timeout = 2000;
        // pjax
        $(document).pjax('.pjax', '#container');
        $(document).on('pjax:send', function() {
            $('#loader').show();
            $('#container').hide();
        });
        $(document).on('pjax:complete', function() {
            $('#loader').hide();
            $('#container').show();
        });
        $(document).on('pjax:success', function(event, response) {
            var msgs = $('li', response);
            if (msgs) {
                $.each(msgs, function(index, value) {
                    noty({
                        text: $(value).html(),
                        type: $(value).attr('class')
                    });
                });
            }
        });
        $(document).on('submit', 'form#contact-form', function(e) {
            $.pjax.submit(e, '#container');
        });
        // canjs
        Alignment = can.Model({
            findAll : 'GET /api/pendvisor/alignment/' + pendvisor.format,
            findOne : 'GET /api/pendvisor/alignment/{id}/' + pendvisor.format,
            //create  : 'POST /api/pendvisor/alignment/' + api_format,
            //update  : 'PUT /api/pendvisor/alignment/{id}/' + api_format,
            //destroy : 'DELETE /api/pendvisor/alignment/{id}/' + api_format,
            models: function(data) {
                return data.objects;
            },
        },{});

        Alignments = can.Control({
            init : function () {
                // Render the Alignments
            },
        });

        // initialize the app
        Alignment.findAll(
            {},
            function (alignments) {
                new Alignments('section#alignments', {
                    alignments: alignments
                });
            }
        );
    });
});
