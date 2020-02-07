Notation
========

### Sets

We use the usual notion for set membership and function application. 


$\Bbb{X}$, $\Bbb{Y}$ and $\Bbb{Z}$ are sets of variables. $\natnums$ are the set of natural numbers. $x, y, z, n$ are meta-variables/shorthand for $x \in \Bbb{X}$, $y \in \Bbb{Y}$, $z \in \Bbb{Z}$, $n \in \natnums$

### Sequences

$y = (y_0, ..., y_n)$ is the sequence of length $Len(y)$ with $i$th element $y_i$. 

$a \frown b$ denotes the concatenation of the sequences $a$ and $b$.


### Map

A map is a set of $(k, v)$ pairs. Each $k$ is associated with a single $v$. $m(k)$ returns $v$ for the $k$ in $m$. $m\{k \mapsto v\}$ denotes $m$ is updated by mapping $v$ to $k$.

### Operations

Operations are written as labelled transitions. The label consists of an operation name and a sequence of arguments.

$$
z  
\xrightarrow{
    \normalsize x(y_n, ...)
} 
z'
$$


