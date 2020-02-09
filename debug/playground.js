// First import the things needed
const {
  proj,
  document,
  root,
  sym,
  pres,
  serialized,
  deserialized,
} = require('..');

proj;
pres;
serialized;
deserialized;

// Normally you don't want to send a whole document in order to distribute content changes.
// Since Abmedium is built on top of Delta-CRDTs you only have to send the change.
////const delta = doc.add(['alt', 'sub-alt', 3], 2222);
////doc2.sync(delta);

var startView = document();
startView.add(root, [1, 2, 3, 7]);
startView.add(1, sym('div#start-view'));
startView.add(2, []);
startView.add(3, [4, 5, 6]);
startView.add(4, sym('h1'));
startView.add(5, []);
startView.add(6, 'Hello, Sir!');
startView.add(7, [8, 9, 10, 14, 18]);
startView.add(8, sym('ul.menu'));
startView.add(9, []);
startView.add(10, [11, 12, 13]);
startView.add(11, sym('li.menu-item'));
startView.add(12, []);
startView.add(13, 'Add article');
startView.add(14, [15, 16, 17]);
startView.add(15, sym('li.menu-item'));
startView.add(16, []);
startView.add(17, 'Review article');
startView.add(18, [19, 20, 21]);
startView.add(19, sym('li.menu-item'));
startView.add(20, []);
startView.add(21, 'Logout');
startView.add(['add-value-to-items', 22], 'data-value');
startView.add(['add-value-to-items', 23], 'add-article');
startView.add(['add-value-to-items', 12], [22, 23]);
startView.add(['add-value-to-items', 24], 'data-value');
startView.add(['add-value-to-items', 25], 'review-article');
startView.add(['add-value-to-items', 16], [24, 25]);
startView.add(['add-value-to-items', 26], 'data-value');
startView.add(['add-value-to-items', 27], 'logout');
startView.add(['add-value-to-items', 20], [26, 27]);
var startView2 = document();
startView2.sync(startView._ormap.state());
startView2.add(['la', 6], 'Salve magister!');
startView.sync(startView2._ormap.state());
startView2.add(['la', 13], 'Articulus addendi');
startView2.add(['la', 17], 'Articulus criticis');
startView2.add(['la', 21], 'Apage');
startView.sync(startView2._ormap.state());
startView.add(['hail-by-name', 28], sym('fun'));
startView.add(['hail-by-name', 29], [30]);
startView.add(['hail-by-name', 30], sym('user-name'));
startView.add(['hail-by-name', 31], [1, 2, 3, 7]); // the old root
startView.add(['hail-by-name', root], [28, 29, 31]);
startView.add(['hail-by-name', 32], sym('concat'));
startView.add(['hail-by-name', 33], 'Hi ');
startView.add(['hail-by-name', 34], sym('user-name'));
startView.add(['hail-by-name', 35], '!');
startView.add(['hail-by-name', 6], [32, 33, 34, 35]);
startView2.add(['la', 6], 'Salve magister!', 'Hello, Sir!');
startView2.add(['la', 13], 'Articulus addendi', 'Add article');
startView2.add(['la', 17], 'Articulus criticis', 'Review article');
startView2.add(['la', 21], 'Apage', 'Logout');
startView.sync(startView2._ormap.state());
startView2.add(['la', 33], 'Salve ');
startView2.add(['la', 6], [32, 33, 34, 35], [32, 33, 34, 35]);
startView2.add(['la', 32], sym('concat'), sym('concat'));
startView2.add(['la', 34], sym('user-name'), sym('user-name'));
startView2.add(['la', 35], '!', '!');
startView.sync(startView2._ormap.state());
startView2.add(['la', 6], 'Salve magister!', 'Hello, Sir!');
startView2.add(['hail-by-name', 'la', 33], 'Salve ');
startView2.add(['hail-by-name', 'la', 6], [32, 33, 34, 35], [32, 33, 34, 35]);
startView2.add(['hail-by-name', 'la', 32], sym('concat'), sym('concat'));
startView2.add(['hail-by-name', 'la', 34], sym('user-name'), sym('user-name'));
startView2.add(['hail-by-name', 'la', 35], '!', '!');
startView.sync(startView2._ormap.state());
startView2.sync(startView._ormap.state());
pres(proj(startView, ['la', ['hail-by-name', ['la']]]));
startView2.add(['la', 6], 'Salve, Magister!', 'Hello, Sir!');
startView.add(['hail-by-name', 30], sym('user'));
startView.add(['hail-by-name', 34], sym('user'));
startView.sync(startView2._ormap.state());
startView2.sync(startView._ormap.state());
startView.add(1, sym('div#startView'));
startView2.add(1, sym('div#start'));
startView.sync(startView2._ormap.state());
startView.add(1, sym('div#start'));
startView.sync(startView2._ormap.state());
startView2.sync(startView._ormap.state());
debugger;
