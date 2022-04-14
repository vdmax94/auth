$(document).on('change', 'input[type=checkbox]', function () {
    var $this = $(this), $chks = $(document.getElementsByName(this.name)), $all = $chks.filter(".chk-all");

    if ($this.hasClass('chk-all')) {
        $chks.prop('checked', $this.prop('checked'));
    } else switch ($chks.filter(":checked").length) {
        case +$all.prop('checked'):
            $all.prop('checked', false).prop('indeterminate', false);
            break;
        case $chks.length - !!$this.prop('checked'):
            $all.prop('checked', true).prop('indeterminate', false);
            break;
        default:
            $all.prop('indeterminate', true);
    }
});

function checker()

{

    if($('input:checkbox').filter(':checked').length==0){

        alert('Не выбран ни один пользователь');

        return false;

    }

    else { return confirm('Подтвердите действие') }

}