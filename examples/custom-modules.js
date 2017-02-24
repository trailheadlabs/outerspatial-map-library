var OuterSpatial = {
  div: 'map',
  homeControl: {
    position: 'topright'
  },
  modules: [{
    content: '<h3>h3. Heading</h3><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque at tellus est. Vestibulum libero dui, fringilla non consequat a, congue et quam. Fusce tristique sagittis eleifend. Praesent viverra sem dolor, sed posuere nisi condimentum laoreet. Vivamus bibendum magna et risus faucibus molestie. Pellentesque pharetra at nisi id interdum. Cras dignissim enim in diam egestas adipiscing. Nulla risus nunc, rutrum eget metus nec, porta ornare nisi. Donec congue velit et est lacinia, sit amet elementum ligula fermentum. Curabitur id porttitor nisl. Praesent vitae dictum dolor.</p><h4>h4. Heading</h4><p>Mauris lacus magna, porttitor porttitor ullamcorper nec, convallis in turpis. Aliquam et malesuada ligula. Suspendisse vehicula nisl vitae bibendum ultrices. Fusce porta suscipit rhoncus. Donec mauris justo, pellentesque quis libero in, volutpat condimentum libero. Nunc hendrerit, nunc a ultrices congue, purus mauris suscipit ligula, ac lobortis lectus arcu quis arcu. Praesent vel turpis eget sapien accumsan sollicitudin sed non nibh. Praesent sagittis nisi ut condimentum malesuada. Aenean ut enim enim. Sed semper dui augue, quis molestie nibh imperdiet a. Pellentesque in tempus urna.</p>',
    icon: 'info',
    title: 'Module #1',
    type: 'custom',
    visible: true
  }, {
    content: '<h3>h3. Another Heading</h3><p>And another paragraph.</p><p>Let\'s do one more.</p>',
    icon: 'globe',
    title: 'Module #2',
    type: 'custom'
  }],
  smallzoomControl: {
    position: 'topright'
  }
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/outerspatial-bootstrap.js';
  document.body.appendChild(s);
})();
