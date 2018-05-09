$(function() {
  // debug listing of groups on site
  $.post('groups', function(data) {
    var groups = data.groups;
    groups.forEach(function(group) {
      $('<li></li>').text(group.groupName).appendTo('ul#dreams');
    });
  });

/*
  $('form').submit(function(event) {
    event.preventDefault();
    var dream = $('input').val();
    $.post('/dreams?' + $.param({dream: dream}), function() {
      $('<li></li>').text(dream).appendTo('ul#dreams');
      $('input').val('');
      $('input').focus();
    });
  });
*/
});
