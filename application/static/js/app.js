
var getBaseURL = function() {
    var url = document.URL;
    return url.substr(0, url.lastIndexOf('/'));
};

$(document).ready(function() {

    //Autonumeric plug-in - automatic addition of dollar signs,etc controlled by tag attributes
    $('.numeric').autoNumeric('init', {
      wEmpty: 'zero',
      lZero: 'deny'
    });

  	$('.numeric_min_un').autoNumeric('set', 1);

    $('.numeric_dec').autoNumeric('init', {
      wEmpty: 'zero',
      lZero: 'deny',
      mDec : 1
    });

    $('#modalNormal').on('hide.bs.modal', function(e) {
        $('.modal-content').html('');
        $(this).removeData('bs.modal');
    });

    var elems = Array.prototype.slice.call(document.querySelectorAll('.switchery'));
// Success color: #10CFBD
    elems.forEach(function(html) {
        var switchery = new Switchery(html, {color: '#10CFBD'});
    });

    $('.Datepicker').datepicker({
      language: 'fr'
    }).mask("99/99/9999");

    $('#datepicker_start').datepicker({
      language: "fr",
      format: 'dd/mm/yyyy'
    }).on('changeDate', function(e) {

          // Proceed with your code
          var date_start = $('#datepicker_start').val();
          var date_end = $('#datepicker_end').val();
          var datas = {};

          var date_start_js = date_start;
          date_start_js = date_start_js.split('/');
          reforme_date = (date_start_js[1]) + '/' + date_start_js[0] + '/' + date_start_js[2];
          date_start_js = new Date(reforme_date);

          var date_end_js = date_end;
          date_end_js = date_end_js.split('/');
          reforme_date = (date_end_js[1]) + '/' + date_end_js[0] + '/' + date_end_js[2];
          date_end_js = new Date(reforme_date);

          if(date_start_js <= date_end_js){
              datas['date_start'] = date_start;
              datas['date_end'] = date_end;
          }else{
              date_end = date_start;
              if($('#datepicker_end').val()){
                  $('#datepicker_end').val(date_start);
              }
              datas['date_start'] = date_start;
              datas['date_end'] = date_end;
          }

    }).mask("99/99/9999");


    $('#datepicker_end').datepicker({
      language: "fr",
      format: 'dd/mm/yyyy'
    }).on('changeDate', function(e) {
          // Proceed with your code
          var date_start = $('#datepicker_start').val();
          var date_end = $('#datepicker_end').val();
          var datas = {};

          var date_start_js = date_start;
          date_start_js = date_start_js.split('/');
          reforme_date = (date_start_js[1]) + '/' + date_start_js[0] + '/' + date_start_js[2];
          date_start_js = new Date(reforme_date);

          var date_end_js = date_end;
          date_end_js = date_end_js.split('/');
          reforme_date = (date_end_js[1]) + '/' + date_end_js[0] + '/' + date_end_js[2];
          date_end_js = new Date(reforme_date);

          if(date_start_js >= date_end_js){
              date_start = date_end;
              if($('#datepicker_start').val()){
                $('#datepicker_start').val(date_end);
              }
              datas['date_start'] = date_start;
              datas['date_end'] = date_end;
          }else{
              datas['date_start'] = date_start;
              datas['date_end'] = date_end;
          }

    }).mask("99/99/9999");


    $('.repeater').repeater({
          show: function () {
              $(this).slideDown();
          },
          hide: function (remove) {
              if(confirm('Etes vous sure de supprimer cet élément ?')) {
                  $(this).slideUp(remove);
              }
          }
      });

    $("input").attr('autocomplete', 'off');

    $('.submit').on('click', function (e) {
        e.preventDefault();
        $('#submitForm').submit();
    })
});
