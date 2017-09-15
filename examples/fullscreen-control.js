var OuterSpatial = {
  div: 'map',
  fullscreenControl: true,
  printControl: true
};

(function () {
  var map = document.getElementById('map');
  var paragraphText = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean placerat tincidunt ultrices. Curabitur ornare accumsan tristique. Sed ut lacus mi. Fusce commodo lacus lorem, suscipit sodales mauris iaculis a. Sed vel nisl ac risus sodales viverra. Pellentesque eu vehicula ipsum. Maecenas dictum felis facilisis tempor porta. Donec sit amet ipsum quis sem fermentum suscipit. Nam sollicitudin turpis eget scelerisque euismod. Praesent eget feugiat sapien. Suspendisse justo mauris, suscipit eu volutpat ac, dignissim ac libero.',
    'Mauris convallis at massa ut feugiat. Morbi iaculis semper velit, eget sodales tellus aliquam vitae. Mauris orci lacus, tristique sed rhoncus vitae, tristique eget erat. Nam venenatis lobortis ante, quis dignissim leo venenatis a. Nulla facilisi. Praesent sed adipiscing massa. In ultricies tristique ipsum, ut vulputate tellus sagittis vitae. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Fusce justo odio, dictum id neque id, ornare adipiscing metus. Curabitur convallis lorem sit amet eros fringilla, ac hendrerit justo tempus. Nullam tincidunt rhoncus tincidunt. Praesent rhoncus aliquam sapien ut auctor.',
    'Duis ullamcorper, lorem sit amet euismod laoreet, lacus lacus elementum turpis, at suscipit mauris mi ut enim. Ut vel libero tristique quam mollis aliquet sit amet id quam. Etiam in mauris a odio ultrices eleifend. Ut ornare, tortor eget dignissim tincidunt, lacus enim convallis ipsum, vel blandit nisl mauris ac dolor. Proin et ligula id ipsum imperdiet congue in sollicitudin velit. Integer in vulputate nunc. Sed quis augue at risus imperdiet accumsan. Duis sollicitudin quam lorem, ac congue diam laoreet sit amet. Vestibulum lorem nisl, viverra ac augue egestas, bibendum consectetur justo.',
    'Etiam lacus eros, dignissim sed rutrum nec, consequat et dolor. Cras massa ipsum, lobortis vitae lacinia ac, rhoncus ut lacus. Suspendisse potenti. Aliquam a rhoncus magna. Duis eu commodo enim, condimentum commodo nunc. Integer mi orci, molestie in placerat nec, accumsan a velit. Morbi semper mattis consectetur. Mauris interdum luctus orci et scelerisque. Etiam at purus eu leo mattis tempus quis sed orci. Nulla rutrum diam quis tincidunt congue. In hac habitasse platea dictumst. Aliquam molestie eros purus, id facilisis lacus laoreet ut. In auctor ac arcu non vehicula. Etiam pellentesque sem at diam mollis egestas. Quisque malesuada dapibus nulla, venenatis luctus mauris pulvinar ac. Aenean egestas nunc eget nisl condimentum, ac tempus metus faucibus.',
    'Cras sed leo a massa posuere lacinia id vel nibh. Quisque a mattis sapien. Sed sit amet lorem ac purus semper elementum quis feugiat diam. Morbi nec nibh vel purus cursus luctus. Suspendisse et nisl pretium, pretium leo sed, adipiscing felis. Sed vitae dui quis lectus laoreet suscipit et eu arcu. Sed ac blandit justo.'
  ];

  document.body.style.display = 'block';
  document.body.style.margin = '8px';

  paragraphText.forEach(function (paragraph) {
    var p = document.createElement('p');
    p.textContent = paragraph;
    document.body.insertBefore(p, map);
  });

  map.style.height = '400px';
  map.style.width = '600px';
  map.style.position = 'static';

  var s = document.createElement('script');
  s.src = '{{ path }}/outerspatial-bootstrap.js';
  document.body.appendChild(s);
})();
