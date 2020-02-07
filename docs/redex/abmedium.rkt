#lang racket
(require redex)

(define-language abmedium
  [sym    variable-not-otherwise-mentioned]
  [handle (variable-prefix /)]
  [seq    (handle ...)]
  [atom   number
          string
          sym]
  [expr   atom
          seq]
  [edge   [handle expr]]
  [doc    [edge ...]])

'(define admedium-red
  (reduction-relation
   abmedium
   (--> )))


