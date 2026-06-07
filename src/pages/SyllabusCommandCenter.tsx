import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Lock, AlertTriangle, CheckCircle2, ChevronRight,
  X, Zap, Shield, BarChart3, XCircle, CheckCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type SubjectKey = 'DSA' | 'DBMS' | 'OS' | 'CN' | 'OOP';
type NodeHighlight = 'active' | 'prereq' | 'muted' | 'normal';

interface RawNode {
  id: string;
  name: string;
  masteryScore: number;
  weightage: 'High' | 'Medium' | 'Low';
  estimatedExamMarks: number;
  prerequisites: string[];
}

interface RawUnit {
  id: string;
  title: string;
  nodes: RawNode[];
}

interface SubjectData {
  subjectCode: string;
  subjectName: string;
  units: RawUnit[];
}

interface FlatNode extends RawNode {
  unitId: string;
  unitTitle: string;
}

type QuizQ = { q: string; opts: [string, string, string, string]; ans: 0 | 1 | 2 | 3 };

const LOCK_THRESHOLD = 60;

const SEMESTER_CURRICULUM: Record<SubjectKey, SubjectData> = {
  DSA: {
    subjectCode: 'CS_303',
    subjectName: 'Data Structures & Algorithms',
    units: [
      {
        id: 'UNIT_01', title: 'Linear Foundations',
        nodes: [
          { id: 'POINTER_STRUCT', name: 'Pointer Structures', masteryScore: 92, weightage: 'High', estimatedExamMarks: 7, prerequisites: [] },
          { id: 'BASIC_QUEUES', name: 'Basic Queue Arrays', masteryScore: 55, weightage: 'Medium', estimatedExamMarks: 4, prerequisites: [] },
          { id: 'STACK_CORE', name: 'Sequential Stacks', masteryScore: 88, weightage: 'High', estimatedExamMarks: 7, prerequisites: ['BASIC_QUEUES'] },
        ],
      },
      {
        id: 'UNIT_02', title: 'Hierarchical Layouts',
        nodes: [
          { id: 'BST_BASICS', name: 'Binary Search Trees', masteryScore: 82, weightage: 'High', estimatedExamMarks: 7, prerequisites: ['POINTER_STRUCT'] },
          { id: 'LINKED_TEMPLATES', name: 'Linked Templates', masteryScore: 35, weightage: 'High', estimatedExamMarks: 7, prerequisites: ['POINTER_STRUCT'] },
        ],
      },
      {
        id: 'UNIT_03', title: 'Advanced Non-Linear',
        nodes: [
          { id: 'AVL_ROTATION', name: 'AVL Tree Rotations', masteryScore: 42, weightage: 'High', estimatedExamMarks: 7, prerequisites: ['BST_BASICS', 'POINTER_STRUCT'] },
          { id: 'GRAPH_CORE', name: 'Graph Foundations', masteryScore: 0, weightage: 'High', estimatedExamMarks: 7, prerequisites: ['LINKED_TEMPLATES', 'BST_BASICS'] },
        ],
      },
      {
        id: 'UNIT_04', title: 'Sorting & Optimization',
        nodes: [
          { id: 'HEAP_STRUCTURES', name: 'Heap Structures', masteryScore: 70, weightage: 'Medium', estimatedExamMarks: 4, prerequisites: ['BST_BASICS'] },
          { id: 'GRAPH_SHORTEST_PATH', name: 'Shortest Path Algos', masteryScore: 0, weightage: 'High', estimatedExamMarks: 10, prerequisites: ['GRAPH_CORE', 'BASIC_QUEUES'] },
        ],
      },
      {
        id: 'UNIT_05', title: 'File Index Models',
        nodes: [
          { id: 'B_TREES', name: 'B-Tree Indices', masteryScore: 0, weightage: 'High', estimatedExamMarks: 7, prerequisites: ['AVL_ROTATION'] },
        ],
      },
    ],
  },
  DBMS: {
    subjectCode: 'CS_304',
    subjectName: 'Database Management Systems',
    units: [
      {
        id: 'UNIT_01', title: 'Relational Foundations',
        nodes: [
          { id: 'ER_MODELING', name: 'E-R Diagrams', masteryScore: 85, weightage: 'High', estimatedExamMarks: 7, prerequisites: [] },
          { id: 'REL_ALGEBRA', name: 'Relational Algebra', masteryScore: 40, weightage: 'High', estimatedExamMarks: 7, prerequisites: [] },
        ],
      },
      {
        id: 'UNIT_02', title: 'Structured Query Lang',
        nodes: [
          { id: 'SQL_JOINS', name: 'Complex SQL Joins', masteryScore: 75, weightage: 'High', estimatedExamMarks: 10, prerequisites: ['REL_ALGEBRA'] },
          { id: 'SUBQUERIES', name: 'Nested Subqueries', masteryScore: 90, weightage: 'Medium', estimatedExamMarks: 4, prerequisites: ['SQL_JOINS'] },
        ],
      },
      {
        id: 'UNIT_03', title: 'Normalization Core',
        nodes: [
          { id: 'FUNC_DEPEND', name: 'Functional Dependencies', masteryScore: 50, weightage: 'High', estimatedExamMarks: 7, prerequisites: ['ER_MODELING'] },
          { id: 'NORMAL_FORMS', name: '1NF, 2NF, 3NF, BCNF', masteryScore: 0, weightage: 'High', estimatedExamMarks: 12, prerequisites: ['FUNC_DEPEND'] },
        ],
      },
      {
        id: 'UNIT_04', title: 'Transaction Control',
        nodes: [
          { id: 'ACID_PROPERTIES', name: 'ACID Transactions', masteryScore: 95, weightage: 'High', estimatedExamMarks: 7, prerequisites: [] },
          { id: 'CONCURRENCY', name: 'Serializability & Locks', masteryScore: 20, weightage: 'High', estimatedExamMarks: 10, prerequisites: ['ACID_PROPERTIES'] },
        ],
      },
      {
        id: 'UNIT_05', title: 'Recovery & Storage',
        nodes: [
          { id: 'INDEX_HASHING', name: 'B+ Tree Indexing', masteryScore: 0, weightage: 'Medium', estimatedExamMarks: 4, prerequisites: ['NORMAL_FORMS'] },
        ],
      },
    ],
  },
  OS: {
    subjectCode: 'CS_305',
    subjectName: 'Operating Systems',
    units: [
      {
        id: 'UNIT_01', title: 'System Structures',
        nodes: [
          { id: 'SYS_CALLS', name: 'System Calls & Kernels', masteryScore: 90, weightage: 'Medium', estimatedExamMarks: 4, prerequisites: [] },
          { id: 'PROCESS_STATE', name: 'PCB & Transitions', masteryScore: 80, weightage: 'High', estimatedExamMarks: 7, prerequisites: [] },
        ],
      },
      {
        id: 'UNIT_02', title: 'CPU Scheduling',
        nodes: [
          { id: 'SCHED_ALGOS', name: 'Scheduling Algorithms', masteryScore: 85, weightage: 'High', estimatedExamMarks: 10, prerequisites: ['PROCESS_STATE'] },
          { id: 'THREADING', name: 'Multithreading Models', masteryScore: 30, weightage: 'Medium', estimatedExamMarks: 4, prerequisites: ['SYS_CALLS'] },
        ],
      },
      {
        id: 'UNIT_03', title: 'Synchronization',
        nodes: [
          { id: 'SEMAPHORES', name: 'Semaphores & Mutex', masteryScore: 45, weightage: 'High', estimatedExamMarks: 8, prerequisites: ['PROCESS_STATE'] },
          { id: 'DEADLOCK_DET', name: "Banker's Algorithm", masteryScore: 0, weightage: 'High', estimatedExamMarks: 10, prerequisites: ['SEMAPHORES'] },
        ],
      },
      {
        id: 'UNIT_04', title: 'Memory Management',
        nodes: [
          { id: 'PAGING_SEG', name: 'Paging & Segmentation', masteryScore: 75, weightage: 'High', estimatedExamMarks: 7, prerequisites: [] },
          { id: 'VIRTUAL_MEM', name: 'Page Replacement Algos', masteryScore: 0, weightage: 'High', estimatedExamMarks: 10, prerequisites: ['PAGING_SEG'] },
        ],
      },
      {
        id: 'UNIT_05', title: 'Disk & File Systems',
        nodes: [
          { id: 'DISK_SCHED', name: 'Disk Scheduling Algos', masteryScore: 0, weightage: 'Medium', estimatedExamMarks: 4, prerequisites: ['SCHED_ALGOS'] },
        ],
      },
    ],
  },
  CN: {
    subjectCode: 'CS_306',
    subjectName: 'Computer Networks',
    units: [
      {
        id: 'UNIT_01', title: 'Physical Layer Core',
        nodes: [
          { id: 'OSI_MODELS', name: 'OSI vs TCP/IP Architecture', masteryScore: 95, weightage: 'High', estimatedExamMarks: 7, prerequisites: [] },
          { id: 'TOPOLOGIES', name: 'Network Topologies', masteryScore: 85, weightage: 'Medium', estimatedExamMarks: 4, prerequisites: [] },
        ],
      },
      {
        id: 'UNIT_02', title: 'Data Link Layer',
        nodes: [
          { id: 'FRAMING_ERR', name: 'CRC & Parity Check Error', masteryScore: 70, weightage: 'High', estimatedExamMarks: 7, prerequisites: ['OSI_MODELS'] },
          { id: 'FLOW_CONTROL', name: 'Sliding Window & ARQ Protocols', masteryScore: 40, weightage: 'High', estimatedExamMarks: 8, prerequisites: ['FRAMING_ERR'] },
        ],
      },
      {
        id: 'UNIT_03', title: 'Network Routing',
        nodes: [
          { id: 'IP_ADDRESSING', name: 'IPv4 Subnetting & CIDR Masks', masteryScore: 65, weightage: 'High', estimatedExamMarks: 12, prerequisites: ['OSI_MODELS'] },
          { id: 'ROUTING_ALGOS', name: 'Link State vs Distance Vector', masteryScore: 0, weightage: 'High', estimatedExamMarks: 10, prerequisites: ['IP_ADDRESSING'] },
        ],
      },
      {
        id: 'UNIT_04', title: 'Transport Protocols',
        nodes: [
          { id: 'TCP_UDP', name: 'TCP 3-Way Handshake vs UDP', masteryScore: 80, weightage: 'High', estimatedExamMarks: 7, prerequisites: ['OSI_MODELS'] },
          { id: 'CONGESTION_CN', name: 'Leaky Bucket & Token Schemes', masteryScore: 15, weightage: 'High', estimatedExamMarks: 8, prerequisites: ['TCP_UDP'] },
        ],
      },
      {
        id: 'UNIT_05', title: 'Application Protocol',
        nodes: [
          { id: 'DNS_SYSTEM', name: 'DNS Resolvers & HTTP Methods', masteryScore: 0, weightage: 'Medium', estimatedExamMarks: 4, prerequisites: ['TCP_UDP'] },
        ],
      },
    ],
  },
  OOP: {
    subjectCode: 'CS_307',
    subjectName: 'Object Oriented Programming (Java)',
    units: [
      {
        id: 'UNIT_01', title: 'Paradigm Basics',
        nodes: [
          { id: 'JVM_ARCH', name: 'JVM Architecture & Memory', masteryScore: 90, weightage: 'High', estimatedExamMarks: 4, prerequisites: [] },
          { id: 'CLASSES_OBJS', name: 'Class Instantiation Rules', masteryScore: 85, weightage: 'High', estimatedExamMarks: 7, prerequisites: [] },
        ],
      },
      {
        id: 'UNIT_02', title: 'Core Pillars',
        nodes: [
          { id: 'INHERITANCE', name: 'Polymorphism & Super Tracks', masteryScore: 75, weightage: 'High', estimatedExamMarks: 10, prerequisites: ['CLASSES_OBJS'] },
          { id: 'ENCAPSULATION', name: 'Access Modifier Scoping', masteryScore: 95, weightage: 'Medium', estimatedExamMarks: 4, prerequisites: ['CLASSES_OBJS'] },
        ],
      },
      {
        id: 'UNIT_03', title: 'Interfaces & Abstract',
        nodes: [
          { id: 'ABS_INTERFACES', name: 'Abstract Classes vs Interfaces', masteryScore: 50, weightage: 'High', estimatedExamMarks: 7, prerequisites: ['INHERITANCE'] },
          { id: 'PACKAGES', name: 'Modular Package Assemblies', masteryScore: 80, weightage: 'Medium', estimatedExamMarks: 4, prerequisites: ['ENCAPSULATION'] },
        ],
      },
      {
        id: 'UNIT_04', title: 'Exception Handling',
        nodes: [
          { id: 'TRY_CATCH', name: 'Throwable Hierarchies & Blocks', masteryScore: 60, weightage: 'High', estimatedExamMarks: 7, prerequisites: ['CLASSES_OBJS'] },
          { id: 'CUSTOM_EX', name: 'Custom Exception Handlers', masteryScore: 0, weightage: 'Medium', estimatedExamMarks: 4, prerequisites: ['TRY_CATCH'] },
        ],
      },
      {
        id: 'UNIT_05', title: 'Advanced Collections',
        nodes: [
          { id: 'JAVA_COLLECTIONS', name: 'Map, Set, ArrayList Matrices', masteryScore: 0, weightage: 'High', estimatedExamMarks: 10, prerequisites: ['ABS_INTERFACES'] },
        ],
      },
    ],
  },
};

const QB: Record<string, QuizQ[]> = {
  POINTER_STRUCT: [
    { q: 'What is the output of: int *p = NULL; *p = 5;', opts: ['5', 'Segmentation Fault', 'NULL', '0'], ans: 1 },
    { q: 'Pointer arithmetic: int arr[] = {10,20,30}; int *p = arr; *(p+2) = ?', opts: ['10', '20', '30', 'Undefined'], ans: 2 },
    { q: 'Which correctly declares a pointer to an integer?', opts: ['int p;', 'int *p;', '&int p;', 'ptr int p;'], ans: 1 },
    { q: "sp->member is syntactic sugar for:", opts: ['sp.member', '(*sp).member', '&sp.member', 'sp*member'], ans: 1 },
    { q: "free(ptr) does NOT:", opts: ['Deallocate heap memory', 'Set ptr to NULL automatically', 'Release OS memory', 'Allow future malloc reuse'], ans: 1 },
  ],
  BASIC_QUEUES: [
    { q: 'Circular queue size=5, front=4, rear=4. Next rear = ?', opts: ['5', '0', '1', '3'], ans: 1 },
    { q: 'Which operation adds an element to a queue?', opts: ['Push', 'Pop', 'Enqueue', 'Dequeue'], ans: 2 },
    { q: 'Enqueue time complexity (array-based queue):', opts: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], ans: 2 },
    { q: 'Queue follows which insertion/deletion principle?', opts: ['LIFO', 'FIFO', 'Random', 'Priority'], ans: 1 },
    { q: 'In linked-list queue, dequeue removes from:', opts: ['Tail', 'Head (front)', 'Middle', 'Any'], ans: 1 },
  ],
  STACK_CORE: [
    { q: "Postfix '2 3 4 * +' evaluates to:", opts: ['20', '14', '24', '18'], ans: 1 },
    { q: 'Which DS is used for balanced parentheses check?', opts: ['Queue', 'Stack', 'Heap', 'Deque'], ans: 1 },
    { q: 'Stack overflow occurs when:', opts: ['Pop on empty stack', 'Push beyond capacity', 'Queue is full', 'Array index exceeded'], ans: 1 },
    { q: 'Time complexity of push on array-backed stack:', opts: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], ans: 2 },
    { q: 'Underflow occurs on:', opts: ['Push when full', 'Pop when empty', 'Peek when full', 'Enqueue when full'], ans: 1 },
  ],
  BST_BASICS: [
    { q: 'In-order traversal of a BST gives elements in:', opts: ['Random order', 'Sorted ascending', 'Sorted descending', 'Reverse insertion order'], ans: 1 },
    { q: 'Average-case search complexity in a balanced BST:', opts: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'], ans: 1 },
    { q: 'In a BST, the right child is always:', opts: ['Smaller than parent', 'Equal to parent', 'Greater than parent', 'Random'], ans: 2 },
    { q: 'Worst-case BST search (completely skewed):', opts: ['O(log n)', 'O(1)', 'O(n)', 'O(n²)'], ans: 2 },
    { q: 'Which traversal visits root LAST?', opts: ['Pre-order', 'In-order', 'Post-order', 'Level-order'], ans: 2 },
  ],
  LINKED_TEMPLATES: [
    { q: 'Deletion from the middle of a singly linked list:', opts: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], ans: 1 },
    { q: 'A doubly linked list node contains:', opts: ['data + next', 'data + prev only', 'data + next + prev', 'data only'], ans: 2 },
    { q: 'Inserting at the HEAD of a singly linked list is:', opts: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], ans: 2 },
    { q: 'In a circular linked list, the last node points to:', opts: ['NULL', 'Itself', 'Head', 'Previous node'], ans: 2 },
    { q: 'Random access in a linked list is:', opts: ['O(1)', 'O(n)', 'Not possible', 'O(log n)'], ans: 1 },
  ],
  AVL_ROTATION: [
    { q: 'Balance factor = height(left subtree) − height(right subtree). AVL requires BF in:', opts: ['{-2, -1, 0, 1}', '{-1, 0, 1}', '{0, 1}', '{-2, 2}'], ans: 1 },
    { q: 'LL imbalance is corrected by:', opts: ['Left rotation', 'Right rotation', 'Left then right', 'Right then left'], ans: 1 },
    { q: 'LR imbalance is corrected by:', opts: ['Single right rotation', 'Left rotation then right rotation', 'Single left rotation', 'Right rotation then left rotation'], ans: 1 },
    { q: 'Balance factor of an AVL leaf node:', opts: ['-1', '0', '1', '2'], ans: 1 },
    { q: 'Maximum height of AVL tree with n nodes:', opts: ['O(n)', 'O(log n)', 'O(√n)', 'O(n²)'], ans: 1 },
  ],
  GRAPH_CORE: [
    { q: 'DFS uses which implicit data structure?', opts: ['Queue', 'Priority Queue', 'Stack (call stack)', 'Heap'], ans: 2 },
    { q: 'BFS/DFS time complexity with adjacency list:', opts: ['O(V²)', 'O(V+E)', 'O(E log V)', 'O(V log E)'], ans: 1 },
    { q: 'A directed acyclic graph (DAG):', opts: ['Has cycles', 'Has no directed cycles', 'Is undirected', 'Has exactly one path between nodes'], ans: 1 },
    { q: 'Adjacency matrix space complexity:', opts: ['O(V+E)', 'O(V²)', 'O(E)', 'O(V)'], ans: 1 },
    { q: 'Bipartite graph detection uses:', opts: ['DFS only (no coloring)', 'BFS with 2-coloring scheme', 'Dijkstra', 'Floyd-Warshall'], ans: 1 },
  ],
  HEAP_STRUCTURES: [
    { q: 'In a max-heap, the parent is always:', opts: ['Smaller than children', 'Greater than or equal to children', 'Equal to children', 'Random'], ans: 1 },
    { q: 'Building a heap from an array (heapify all): time complexity:', opts: ['O(n log n)', 'O(n)', 'O(log n)', 'O(1)'], ans: 1 },
    { q: 'For min-heap: parent ≤ children. Extracting min is:', opts: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'], ans: 2 },
    { q: 'Heap sort total time complexity:', opts: ['O(n²)', 'O(n log n)', 'O(n)', 'O(log n)'], ans: 1 },
    { q: 'A heap is stored as a:', opts: ['Linked list', 'Complete binary tree (array form)', 'BST', 'AVL tree'], ans: 1 },
  ],
  GRAPH_SHORTEST_PATH: [
    { q: 'Dijkstra fails for graphs with:', opts: ['Undirected edges', 'Negative-weight edges', 'Disconnected components', 'Weighted edges'], ans: 1 },
    { q: 'Bellman-Ford time complexity (V vertices, E edges):', opts: ['O(V+E)', 'O(V·E)', 'O(E log V)', 'O(V²)'], ans: 1 },
    { q: 'Floyd-Warshall computes shortest paths between:', opts: ['Single source only', 'All pairs of vertices', 'Only adjacent nodes', 'Only one destination'], ans: 1 },
    { q: 'Dijkstra uses which structure for efficiency?', opts: ['Stack', 'FIFO Queue', 'Min-Heap / Priority Queue', 'Hash Map'], ans: 2 },
    { q: "Edge relaxation in Dijkstra: dist[v] = min(dist[v], dist[u] + w(u,v)). This is called:", opts: ['Expansion', 'Relaxation', 'Extraction', 'Propagation'], ans: 1 },
  ],
  B_TREES: [
    { q: 'A B-tree of order m has maximum keys per node:', opts: ['m', 'm−1', 'm+1', '2m−1'], ans: 1 },
    { q: 'All leaf nodes in a B+ tree are:', opts: ['At varying levels', 'At the same level AND linked', 'Only at root', 'Not linked'], ans: 1 },
    { q: 'Minimum keys in a non-root B-tree node of order m:', opts: ['⌈m/2⌉−1', 'm−1', '1', '⌊m/2⌋'], ans: 0 },
    { q: 'B+ tree differs from B-tree because:', opts: ['Has no leaf nodes', 'All data in leaves, leaves linked as list', 'Root has no children', 'It is unbalanced'], ans: 1 },
    { q: 'B-trees are preferred in databases for:', opts: ['Low memory use', 'Disk I/O efficiency + sorted range queries', 'Faster than hash tables always', 'Simplicity of implementation'], ans: 1 },
  ],
  ER_MODELING: [
    { q: 'A weak entity is represented by:', opts: ['Single diamond', 'Double rectangle', 'Ellipse', 'Dashed rectangle'], ans: 1 },
    { q: 'Many-to-many relationship requires in relational schema:', opts: ['Only a foreign key', 'A bridge/associative table', 'Only a primary key', 'A composite attribute'], ans: 1 },
    { q: 'Cardinality 1:N means:', opts: ['Many relate to many', 'One entity instance relates to many', 'One to one', 'None of these'], ans: 1 },
    { q: 'A derived attribute in ER modeling is:', opts: ['Stored permanently in DB', 'Computed from other attributes', 'Multi-valued by default', 'A primary key'], ans: 1 },
    { q: 'ISA hierarchy represents:', opts: ['Aggregation', 'Generalization / Specialization', 'Participation constraint', 'Cardinality ratio'], ans: 1 },
  ],
  REL_ALGEBRA: [
    { q: 'The σ (sigma) operator performs:', opts: ['Projection of columns', 'Selection of rows by condition', 'Natural join', 'Union of relations'], ans: 1 },
    { q: 'The π (pi) operator selects:', opts: ['Rows based on condition', 'Specific columns (eliminates duplicates)', 'All rows', 'Cross product'], ans: 1 },
    { q: 'Natural join eliminates:', opts: ['All duplicate rows', 'Duplicate copies of common join attribute', 'NULL values', 'All foreign keys'], ans: 1 },
    { q: 'UNION requires relations to be:', opts: ['Same cardinality', 'Union-compatible (same arity, compatible domains)', 'Same primary key', 'Sorted'], ans: 1 },
    { q: 'Cartesian product R(3 rows) × S(4 rows) = ?', opts: ['7 rows', '12 rows', '4 rows', '3 rows'], ans: 1 },
  ],
  SQL_JOINS: [
    { q: 'INNER JOIN returns:', opts: ['All left rows', 'All right rows', 'Only rows with matching keys in both tables', 'All rows from both tables'], ans: 2 },
    { q: 'LEFT OUTER JOIN includes:', opts: ['Only matching rows', 'All left rows + matched right (NULL for unmatched)', 'All rows from both', 'Only non-matching rows'], ans: 1 },
    { q: 'CROSS JOIN on tables A(4 rows) and B(6 rows) yields:', opts: ['10 rows', '24 rows', '4 rows', '6 rows'], ans: 1 },
    { q: 'SELF JOIN is used to:', opts: ['Join two different tables', 'Join a table with itself', 'Join primary and foreign key tables only', 'Join views'], ans: 1 },
    { q: 'To find employees with NO matching manager, use:', opts: ['INNER JOIN', 'CROSS JOIN', 'LEFT OUTER JOIN with NULL check', 'NATURAL JOIN'], ans: 2 },
  ],
  SUBQUERIES: [
    { q: 'A correlated subquery is executed:', opts: ['Once for entire outer query', 'Once per row of the outer query', 'Only when EXISTS is used', 'Only at compile time'], ans: 1 },
    { q: 'EXISTS operator returns:', opts: ['A set of rows', 'TRUE or FALSE', 'Count of matching rows', 'First matching row only'], ans: 1 },
    { q: 'The IN operator with subquery:', opts: ['Checks if value exists in result set', 'Joins two tables', 'Updates matching rows', 'Counts rows'], ans: 0 },
    { q: 'An uncorrelated subquery executes:', opts: ['Multiple times (once per outer row)', 'Once (independent of outer query)', 'Depending on index availability', 'Never independently'], ans: 1 },
    { q: 'The ALL keyword means the comparison must hold for:', opts: ['At least one result', 'Every result in the subquery', 'The first result only', 'The last result only'], ans: 1 },
  ],
  FUNC_DEPEND: [
    { q: "Armstrong's Reflexivity: if Y ⊆ X then:", opts: ['X → Y', 'Y → X', 'XY → XY', 'X → XY'], ans: 0 },
    { q: 'The closure X+ of attribute set X is:', opts: ['Set of all candidate keys', 'All attributes functionally reachable from X', 'Minimal cover of X', 'Superkey set'], ans: 1 },
    { q: 'A functional dependency X → Y is trivial if:', opts: ['X = Y', 'Y ⊆ X', 'X ⊆ Y', 'X ∩ Y = ∅'], ans: 1 },
    { q: 'Partial dependency means a non-prime attribute depends on:', opts: ['The full composite primary key', 'A proper subset of the primary key', 'Another non-prime attribute', 'A foreign key'], ans: 1 },
    { q: 'Minimal cover removes:', opts: ['All FDs', 'Redundant FDs and extraneous attributes from LHS', 'All non-prime attributes', 'Primary keys'], ans: 1 },
  ],
  NORMAL_FORMS: [
    { q: '1NF requires all attributes to be:', opts: ['Part of primary key', 'Atomic/single-valued (no repeating groups)', 'Non-null', 'Unique across tuples'], ans: 1 },
    { q: '2NF eliminates:', opts: ['Transitive dependencies', 'Partial dependencies of non-prime on prime key', 'Multi-valued attributes', 'Redundant foreign keys'], ans: 1 },
    { q: '3NF eliminates:', opts: ['Partial dependencies', 'Transitive dependencies of non-prime on candidate key', 'Multi-valued dependencies', 'All redundancy'], ans: 1 },
    { q: 'BCNF is violated when:', opts: ['A non-prime determines a prime attribute', 'A prime determines a non-prime', 'A key determines another key', 'Partial dependency exists'], ans: 0 },
    { q: 'Which NF guarantees no anomalies from functional dependencies?', opts: ['2NF', '3NF', 'BCNF', '4NF'], ans: 2 },
  ],
  ACID_PROPERTIES: [
    { q: 'Which ACID property ensures all-or-nothing execution?', opts: ['Consistency', 'Isolation', 'Atomicity', 'Durability'], ans: 2 },
    { q: 'Durability guarantees committed data persists:', opts: ['Until rollback', 'Even after system crashes', 'Only in RAM', 'During transaction only'], ans: 1 },
    { q: "Isolation level 'READ COMMITTED' specifically prevents:", opts: ['Phantom reads', 'Non-repeatable reads', 'Dirty reads', 'Lost updates'], ans: 2 },
    { q: 'Consistency in ACID means:', opts: ['Data copies always match', 'DB transitions from one valid state to another', 'Users are isolated', 'Atomicity is enforced'], ans: 1 },
    { q: 'Which ACID property is primarily maintained by WAL logging?', opts: ['Atomicity', 'Consistency', 'Isolation', 'Durability'], ans: 3 },
  ],
  CONCURRENCY: [
    { q: 'Two-Phase Locking (2PL) phases are:', opts: ['Read and Write', 'Growing (acquire) and Shrinking (release)', 'Lock and Unlock', 'Shared and Exclusive'], ans: 1 },
    { q: 'A serial schedule is always:', opts: ['Most efficient', 'Conflict-serializable (correct by definition)', 'Concurrent', 'Faster than interleaved'], ans: 1 },
    { q: 'A Shared (S) lock allows:', opts: ['Only reads (concurrent with other S-locks)', 'Only writes', 'Both reads and writes', 'Neither'], ans: 0 },
    { q: 'Timestamp-based concurrency control:', opts: ['Uses 2PL exclusively', 'Assigns timestamps to serialize transactions without locks', 'Prevents all deadlocks via locking', 'Uses only optimistic control'], ans: 1 },
    { q: 'Deadlock prevention strategies include:', opts: ['More locks', 'Wait-Die and Wound-Wait preemption schemes', 'Larger transactions', 'Removing isolation level'], ans: 1 },
  ],
  INDEX_HASHING: [
    { q: 'B+ tree internal nodes store:', opts: ['Full data records', 'Only keys for routing (no data)', 'Overflow bucket pointers', 'Hash values'], ans: 1 },
    { q: 'Static hashing limitation:', opts: ['Slow search O(n)', 'Fixed bucket count → overflow as data grows', 'High tree height', 'Requires sorted insertion'], ans: 1 },
    { q: 'Extendible hashing uses:', opts: ['Fixed-size directory', 'Directory that doubles on overflow', 'Linear probing chain', 'B+ tree internally'], ans: 1 },
    { q: 'A dense index has one entry for:', opts: ['Each distinct key value (non-clustered)', 'Every record in the file', 'Only primary key records', 'Cluster group leaders'], ans: 1 },
    { q: 'A clustered index means data file is:', opts: ['Randomly ordered', 'Physically sorted by the indexed attribute', 'Stored in a separate structure', 'Used only for hash files'], ans: 1 },
  ],
  SYS_CALLS: [
    { q: 'fork() return value in the CHILD process is:', opts: ['1', '-1', '0', "Parent's PID"], ans: 2 },
    { q: 'exec() system call does:', opts: ['Creates a child process', 'Replaces current process image with a new program', 'Allocates heap memory', 'Creates a thread'], ans: 1 },
    { q: 'Which call creates an IPC pipe?', opts: ['open()', 'pipe()', 'fork()', 'dup2()'], ans: 1 },
    { q: 'A monolithic kernel runs all OS services in:', opts: ['User space', 'Kernel space (single large binary)', 'Separate user processes', 'Hardware registers'], ans: 1 },
    { q: 'System call overhead is higher than a function call because:', opts: ['Larger code size', 'Mode switch (user → kernel) and context save required', 'More parameters', 'Network I/O involved'], ans: 1 },
  ],
  PROCESS_STATE: [
    { q: 'A process moves Running → Ready when:', opts: ['I/O request made', 'Preempted by scheduler (time quantum expires)', 'Process terminates', 'Memory page fault occurs'], ans: 1 },
    { q: 'PCB (Process Control Block) stores:', opts: ['Program source code only', 'PID, CPU registers, memory maps, state, accounting info', 'File contents', 'Only stack pointer'], ans: 1 },
    { q: 'Waiting → Ready transition occurs when:', opts: ['Time quantum expires', 'Requested I/O or event completes', 'Process is created', 'CPU becomes free'], ans: 1 },
    { q: 'A zombie process has:', opts: ['No PID', 'Finished execution but parent has NOT read exit status', 'No memory', 'No file descriptors'], ans: 1 },
    { q: 'Context switch saves and restores:', opts: ['Only the program counter', 'All CPU registers + process state (full context)', 'Memory pages only', 'File descriptor tables only'], ans: 1 },
  ],
  SCHED_ALGOS: [
    { q: 'Convoy effect is associated with:', opts: ['Round Robin', 'Shortest Job First', 'FCFS (long job blocks short ones)', 'Priority scheduling'], ans: 2 },
    { q: 'SRTF is the preemptive version of:', opts: ['FCFS', 'Priority', 'SJF', 'Round Robin'], ans: 2 },
    { q: 'Round Robin with very large time quantum approaches behavior of:', opts: ['SJF', 'FCFS', 'Priority', 'SRTF'], ans: 1 },
    { q: 'Turnaround Time =', opts: ['Burst Time − Wait Time', 'Completion Time − Arrival Time', 'Response Time + Burst', 'CPU Time only'], ans: 1 },
    { q: 'Response time is minimized best by:', opts: ['FCFS', 'SRTF', 'Round Robin (small quantum)', 'Priority (non-preemptive)'], ans: 2 },
  ],
  THREADING: [
    { q: 'User-level threads are managed by:', opts: ['OS kernel scheduler', 'User-space thread library (e.g., pthreads)', 'Hardware MMU', 'Device driver'], ans: 1 },
    { q: 'Threads in the same process share:', opts: ['Stack', 'Registers', 'Code, heap, and global data', 'PC register'], ans: 2 },
    { q: 'If one many-to-one model user thread blocks on I/O:', opts: ['Only that thread stops', 'All threads in the process block (kernel sees 1 thread)', 'Kernel reschedules remaining threads', 'OS creates new thread'], ans: 1 },
    { q: 'Many-to-many threading model maps:', opts: ['Many kernel threads to one user thread', 'Many user threads to many kernel threads (flexible)', 'One-to-one strictly', 'All threads to one CPU'], ans: 1 },
    { q: 'Race condition occurs when:', opts: ['Process terminates unexpectedly', 'Multiple threads access shared data without synchronization', 'Context switch is too slow', 'Deadlock is detected'], ans: 1 },
  ],
  SEMAPHORES: [
    { q: 'Binary semaphore value range:', opts: ['0 to n', '0 to 1 only', '−1 to 1', '0 to ∞'], ans: 1 },
    { q: 'wait() (P operation) does:', opts: ['Increments semaphore', 'Decrements semaphore, blocks if < 0', 'Locks mutex only', 'Signals other processes'], ans: 1 },
    { q: 'Counting semaphore initialized to N controls:', opts: ['Single critical section', 'Access to a pool of N resources', 'Thread priorities', 'Memory pages'], ans: 1 },
    { q: 'Monitor provides advantages over semaphores because:', opts: ['Faster execution', 'Higher-level abstraction with automatic mutual exclusion', 'No condition variables needed', 'Hardware-level support'], ans: 1 },
    { q: 'Classic Producer-Consumer uses semaphores named:', opts: ['One binary semaphore', 'empty, full, and mutex', 'Two binary semaphores', 'One counting only'], ans: 1 },
  ],
  DEADLOCK_DET: [
    { q: "Banker's Algorithm is a deadlock:", opts: ['Detection algorithm', 'Recovery algorithm', 'Avoidance algorithm', 'Prevention algorithm'], ans: 2 },
    { q: "Safety sequence in Banker's Algorithm means:", opts: ['All processes can finish in that order without deadlock', 'All resources freed simultaneously', 'Resources are unlimited', 'Circular wait is absent'], ans: 0 },
    { q: "Need matrix = ?", opts: ['Max − Allocation', 'Allocation + Available', 'Max + Allocation', 'Available − Max'], ans: 0 },
    { q: 'A system state is safe if:', opts: ['No process is waiting', 'At least one safe sequence exists', 'All resources available', 'Circular wait present but managed'], ans: 1 },
    { q: 'Cycle in Resource Allocation Graph implies deadlock ONLY if:', opts: ['Multiple resource instances exist', 'Each resource type has exactly one instance', 'Deadlock always with any cycle', 'No instances available'], ans: 1 },
  ],
  PAGING_SEG: [
    { q: 'Page table translates:', opts: ['Physical → Logical address', 'Logical (virtual) → Physical address', 'Virtual → Cache', 'Cache → Physical'], ans: 1 },
    { q: 'TLB (Translation Lookaside Buffer) is:', opts: ['Main page table storage', 'Cache for recent page-table lookups', 'Replacement algorithm', 'Disk sector map'], ans: 1 },
    { q: 'Internal fragmentation occurs in:', opts: ['Pure segmentation', 'Paging (last page not fully used)', 'Best-fit contiguous allocation', 'Compaction technique'], ans: 1 },
    { q: 'Segmentation provides:', opts: ['Fixed equal-size segments', 'Variable-size segments matching logical structure', 'Only page-aligned segments', 'Uniform 1KB chunks'], ans: 1 },
    { q: 'Page fault occurs when:', opts: ['TLB hit', 'Referenced page not in physical memory', 'Frame is dirty', 'Write to read-only page always'], ans: 1 },
  ],
  VIRTUAL_MEM: [
    { q: 'Optimal (OPT) page replacement replaces the page:', opts: ['Not used recently (like LRU)', 'Not used for longest time in future', 'First loaded (FIFO)', 'Selected randomly'], ans: 1 },
    { q: "LRU approximation uses:", opts: ['Future reference string', 'Reference bit/counter from past accesses', 'Clock hand only', 'Random sampling'], ans: 1 },
    { q: 'Thrashing is characterized by:', opts: ['Very high CPU utilization', 'CPU utilization drops as OS spends more time paging than executing', 'Large page sizes', 'Sufficient physical RAM'], ans: 1 },
    { q: "Belady's Anomaly (more frames → more faults) occurs in:", opts: ['LRU', 'Optimal', 'FIFO', 'Clock'], ans: 2 },
    { q: 'Working Set model tracks pages accessed within window Δ to:', opts: ['Predict future pages precisely', 'Determine how many frames a process needs', 'Replace all old pages', 'Implement LRU exactly'], ans: 1 },
  ],
  DISK_SCHED: [
    { q: 'SSTF minimizes:', opts: ['Rotational latency only', 'Seek time to the next request (greedy)', 'Transfer time', 'Total cylinder traversal distance'], ans: 1 },
    { q: 'SCAN (elevator) algorithm:', opts: ['Services closest request', 'Sweeps disk end-to-end, reversing at boundaries', 'Services in FIFO order', 'Selects randomly'], ans: 1 },
    { q: 'C-SCAN differs from SCAN in that:', opts: ['Goes bidirectional', 'Only services requests in one direction, resets to start', 'Selects randomly', 'Equivalent to LOOK'], ans: 1 },
    { q: 'LOOK is SCAN but:', opts: ['Doubles seek speed', 'Stops at last request in each direction (not disk boundary)', 'Services in reverse only', 'Same as SSTF'], ans: 1 },
    { q: 'Rotational latency is time for:', opts: ['Arm to move to cylinder', 'Disk platter to rotate correct sector under read head', 'Data transfer once positioned', 'Controller decode'], ans: 1 },
  ],
  OSI_MODELS: [
    { q: 'Which OSI layer handles IP routing?', opts: ['Data Link (Layer 2)', 'Network (Layer 3)', 'Transport (Layer 4)', 'Physical (Layer 1)'], ans: 1 },
    { q: 'TCP/IP model combines which OSI layers into "Application"?', opts: ['Physical + Data Link', 'Network + Transport', 'Session + Presentation + Application', 'All 7 layers'], ans: 2 },
    { q: 'PDU at Transport layer is called:', opts: ['Frame', 'Packet', 'Segment', 'Bit'], ans: 2 },
    { q: 'End-to-end error recovery and flow control is at:', opts: ['Network layer', 'Data Link layer', 'Transport layer', 'Session layer'], ans: 2 },
    { q: 'MAC addresses operate at which OSI layer?', opts: ['Physical', 'Data Link', 'Network', 'Transport'], ans: 1 },
  ],
  TOPOLOGIES: [
    { q: 'If the central hub fails in a star topology:', opts: ['Only one connected node fails', 'All nodes lose communication', 'Ring activates as backup', 'Bus takes over'], ans: 1 },
    { q: 'Full-mesh topology with 5 nodes requires how many links?', opts: ['5', '8', '10', '20'], ans: 2 },
    { q: 'Bus topology uses:', opts: ['Fiber optic ring', 'A single shared transmission cable', 'Separate cables for each pair', 'Wireless links'], ans: 1 },
    { q: 'Ring topology failure of one node (without bypass):', opts: ['Does not affect others', 'Brings entire ring down', 'Converts to star', 'Converts to bus'], ans: 1 },
    { q: 'Tree topology is hierarchical combination of:', opts: ['Bus and Ring', 'Star and Bus', 'Mesh and Ring', 'Star and Mesh'], ans: 1 },
  ],
  FRAMING_ERR: [
    { q: 'CRC-16 uses a generator polynomial of degree:', opts: ['8', '12', '16', '32'], ans: 2 },
    { q: 'Hamming code can detect AND correct:', opts: ['Burst errors', 'Single-bit errors', 'Double-bit errors', 'All multi-bit errors'], ans: 1 },
    { q: 'Even parity sets the parity bit so total number of 1-bits is:', opts: ['Odd', 'Even', 'Zero', 'One'], ans: 1 },
    { q: 'CRC remainder ≠ 0 at receiver indicates:', opts: ['No error', 'Error detected in transmission', 'Correct frame received', 'Header corruption only'], ans: 1 },
    { q: 'CRC remainder = 0 guarantees:', opts: ['Absolutely no errors occurred', 'No CRC-detectable errors (undetectable burst may exist)', 'All bits are correct', 'Error was corrected'], ans: 1 },
  ],
  FLOW_CONTROL: [
    { q: 'Go-Back-N on detecting error frame N retransmits:', opts: ['Only frame N', 'Frame N and all subsequent frames in window', 'Only next frame N+1', 'No frames (just sends NAK)'], ans: 1 },
    { q: 'Selective Repeat receiver buffer must be at least:', opts: ['Size 1', 'Equal to the sender window size', 'Twice the window size', 'Unlimited'], ans: 1 },
    { q: 'Stop-and-Wait protocol window size is:', opts: ['0', '1', 'n (configurable)', 'Unlimited'], ans: 1 },
    { q: 'Maximum sender window size for Go-Back-N with n-bit sequence number:', opts: ['2^n', '2^n − 1', '2^(n−1)', 'n'], ans: 1 },
    { q: 'Efficiency of Stop-and-Wait when propagation delay >> transmission delay:', opts: ['Close to 100%', 'Very low (most time spent waiting)', 'Exactly 50%', 'Dependent on error rate only'], ans: 1 },
  ],
  IP_ADDRESSING: [
    { q: 'CIDR /26 subnet provides how many usable host addresses?', opts: ['62', '64', '30', '126'], ans: 0 },
    { q: 'Private IP range 192.168.0.0/16 belongs to class:', opts: ['A', 'B', 'C', 'D'], ans: 2 },
    { q: 'Private Class A range is:', opts: ['172.16.0.0/12', '10.0.0.0/8', '192.168.0.0/16', '169.254.0.0/16'], ans: 1 },
    { q: 'CIDR (Classless Inter-Domain Routing) allows:', opts: ['Only classful addressing', 'Variable-length subnet masks for flexible allocation', 'Only /8 /16 /24 masks', 'IPv6 addresses only'], ans: 1 },
    { q: 'Default subnet mask for Class B address:', opts: ['255.0.0.0', '255.255.0.0', '255.255.255.0', '255.255.255.128'], ans: 1 },
  ],
  ROUTING_ALGOS: [
    { q: 'Link State routing calculates shortest paths using:', opts: ['Bellman-Ford algorithm', "Dijkstra's algorithm", 'Floyd-Warshall', "Prim's MST"], ans: 1 },
    { q: 'Distance Vector routing problem:', opts: ['High memory consumption', 'Count-to-infinity (slow convergence on failure)', 'Too many control packets', 'No routing loops possible'], ans: 1 },
    { q: 'RIP (Routing Information Protocol) is based on:', opts: ['Link State', 'Distance Vector (max 15 hops)', 'Path Vector', 'Hybrid'], ans: 1 },
    { q: 'OSPF (Open Shortest Path First) is a:', opts: ['Distance Vector IGP', 'Link State IGP', 'Path Vector EGP', 'Hybrid EGP'], ans: 1 },
    { q: 'BGP (Border Gateway Protocol) is used for:', opts: ['Intra-AS routing', 'Inter-AS / inter-domain routing', 'LAN switching', 'Physical topology discovery'], ans: 1 },
  ],
  TCP_UDP: [
    { q: 'TCP 3-way handshake sequence:', opts: ['SYN → ACK → SYN-ACK', 'SYN → SYN-ACK → ACK', 'ACK → SYN → FIN', 'SYN → FIN → ACK'], ans: 1 },
    { q: 'UDP is preferred for:', opts: ['Reliable file transfer', 'Live video streaming and gaming', 'Email delivery', 'Secure web browsing'], ans: 1 },
    { q: 'TCP connection teardown uses:', opts: ['2-way handshake', '4-way handshake (FIN/ACK × 2)', '3-way handshake', 'Single RST packet'], ans: 1 },
    { q: 'Standard TCP port for HTTPS:', opts: ['21', '80', '443', '8080'], ans: 2 },
    { q: 'Which protocol provides both flow control and congestion control?', opts: ['UDP', 'IP', 'TCP', 'ICMP'], ans: 2 },
  ],
  CONGESTION_CN: [
    { q: 'Leaky bucket algorithm outputs data at:', opts: ['Variable burst rate', 'Constant rate regardless of input bursts', 'Input peak rate', 'Zero until full'], ans: 1 },
    { q: 'Token bucket allows:', opts: ['Only constant output rate', 'Burst up to bucket size, then limited by token rate', 'No bursting ever', 'Unlimited burst'], ans: 1 },
    { q: 'TCP Slow Start initial congestion window (cwnd) size:', opts: ['MSS × 2', '1 MSS', 'Unlimited', 'Receiver window size'], ans: 1 },
    { q: 'AIMD (Additive Increase, Multiplicative Decrease) is used in:', opts: ['UDP', 'IP routing', 'TCP congestion control', 'ARP'], ans: 2 },
    { q: 'TCP halves its congestion window upon detecting:', opts: ['Timeout (packet loss)', 'New connection', 'ACK reception', 'UDP datagram drop'], ans: 0 },
  ],
  DNS_SYSTEM: [
    { q: 'Recursive DNS resolution means:', opts: ['Client queries each server directly', 'DNS resolver queries on behalf of client until final answer', 'Root server resolves everything', 'Browser handles all resolution'], ans: 1 },
    { q: "DNS 'A' record maps:", opts: ['Domain name → IPv4 address', 'IPv4 → domain name (reverse)', 'Domain → mail server', 'Alias → canonical name'], ans: 0 },
    { q: 'HTTP status 404 indicates:', opts: ['Server internal error', 'Requested resource not found', 'Redirect to new URL', 'Unauthorized access'], ans: 1 },
    { q: 'HTTP is:', opts: ['Stateful, connection-oriented', 'Stateless (each request independent by default)', 'UDP-based', 'Encrypted by default'], ans: 1 },
    { q: 'HTTPS encrypts using:', opts: ['FTP', 'SSH tunneling', 'TLS/SSL protocol', 'IPSec VPN'], ans: 2 },
  ],
  JVM_ARCH: [
    { q: 'JIT (Just-In-Time) compiler converts:', opts: ['Source code to bytecode', 'Bytecode to native machine code at runtime', 'Assembly to bytecode', 'Native code to bytecode'], ans: 1 },
    { q: 'JVM memory area storing static variables and class metadata:', opts: ['Stack', 'Heap', 'Method Area / Metaspace', 'PC Register'], ans: 2 },
    { q: 'Garbage Collector primarily operates on:', opts: ['Stack memory', 'Heap memory', 'Method Area', 'Native Method Stack'], ans: 1 },
    { q: 'WORA principle means Java programs:', opts: ['Are platform-specific executables', 'Compiled once (bytecode), run on any JVM', 'Only run on JVM servers', 'Must be recompiled for each OS'], ans: 1 },
    { q: 'ClassLoader is responsible for:', opts: ['Garbage collection', 'Loading .class files into JVM memory', 'JIT compilation', 'Thread scheduling'], ans: 1 },
  ],
  CLASSES_OBJS: [
    { q: "'this' keyword in Java refers to:", opts: ['Parent class instance', 'Current class instance', 'Static context', 'Return value of method'], ans: 1 },
    { q: 'Constructor differs from a regular method: constructor has:', opts: ['A return type', 'No return type and same name as class', 'static modifier', 'Inherited behavior'], ans: 1 },
    { q: 'Static members in Java belong to:', opts: ['Each object instance separately', 'The class itself (shared by all instances)', 'A specific method scope', 'Interface only'], ans: 1 },
    { q: "Java object creation uses:", opts: ['create keyword', 'new keyword', 'init keyword', 'alloc keyword'], ans: 1 },
    { q: 'A final class in Java:', opts: ['Cannot be extended (subclassed)', 'Cannot be instantiated directly', 'Has no methods', 'Must be abstract'], ans: 0 },
  ],
  INHERITANCE: [
    { q: 'Method overriding requires:', opts: ['Same name, different parameters', 'Same name AND same parameters in child class', 'Different name, same return type', 'Static modifier'], ans: 1 },
    { q: 'super() in constructor calls:', opts: ['Child constructor', "Parent class's constructor", 'Creates superclass object separately', 'Is always optional'], ans: 1 },
    { q: 'Java supports multiple inheritance through:', opts: ['Multiple class extensions', 'Implementing multiple interfaces', 'No multiple inheritance at all', 'Only single interface'], ans: 1 },
    { q: 'Runtime polymorphism (dynamic dispatch) is achieved via:', opts: ['Method overloading', 'Method overriding with superclass reference', 'Constructor chaining', 'Static binding'], ans: 1 },
    { q: 'Which modifier prevents a method from being overridden?', opts: ['private', 'static', 'final', 'protected'], ans: 2 },
  ],
  ENCAPSULATION: [
    { q: 'private access modifier restricts access to:', opts: ['Same package', 'Only the same class', 'Subclasses', 'All classes in project'], ans: 1 },
    { q: 'Purpose of getters and setters:', opts: ['Increase code verbosity', 'Provide controlled, validated access to private fields', 'Replace constructors', 'Make all fields effectively public'], ans: 1 },
    { q: 'protected access allows access from:', opts: ['Same class only', 'Same class + subclasses + same package', 'Everywhere globally', 'Only interface implementations'], ans: 1 },
    { q: 'Data hiding is primarily achieved through:', opts: ['Polymorphism', 'Inheritance hierarchies', 'Encapsulation (private fields)', 'Abstraction layers'], ans: 2 },
    { q: 'final variable in Java:', opts: ['Is static by default', 'Can be re-assigned once', 'Cannot be modified after initialization', 'Is always public'], ans: 2 },
  ],
  ABS_INTERFACES: [
    { q: 'Abstract class vs Interface: abstract class CAN have:', opts: ['Only abstract methods', 'Concrete methods + instance variables + constructors', 'No constructors ever', 'Only static methods'], ans: 1 },
    { q: 'Interface default methods (Java 8+) are:', opts: ['Mandatory to override in all implementing classes', 'Optional to override (provide default implementation)', 'Abstract by default', 'Static only'], ans: 1 },
    { q: 'A Java class can implement:', opts: ['Only 1 interface', 'Maximum 2 interfaces', 'Multiple interfaces (unlimited)', 'Same number as it extends classes'], ans: 2 },
    { q: 'A @FunctionalInterface has exactly:', opts: ['0 abstract methods', '1 abstract method', '2 abstract methods', 'Unlimited abstract methods'], ans: 1 },
    { q: 'Interface variables are implicitly:', opts: ['private final', 'public static final', 'protected abstract', 'private static'], ans: 1 },
  ],
  PACKAGES: [
    { q: 'Default (package-private) access modifier means accessible from:', opts: ['Anywhere', 'Only within the same package', 'Private to class', 'Public globally'], ans: 1 },
    { q: 'The import statement:', opts: ['Copies external code into file', 'Allows use of class names without full qualification', 'Compiles external library', 'Links JAR at runtime'], ans: 1 },
    { q: 'java.lang package is:', opts: ['Must be explicitly imported', 'Automatically imported by compiler', 'Not part of standard JDK', 'Part of user code'], ans: 1 },
    { q: 'Java package naming convention:', opts: ['PascalCase', 'camelCase', 'reversed.domain.lowercase', 'ALL_CAPS'], ans: 2 },
    { q: 'CLASSPATH environment variable tells JVM:', opts: ['Memory heap limits', 'Where to find .class files at runtime', 'Network configuration', 'Thread scheduling policy'], ans: 1 },
  ],
  TRY_CATCH: [
    { q: 'Root of Java exception hierarchy:', opts: ['Error', 'Exception', 'Throwable', 'RuntimeException'], ans: 2 },
    { q: 'Checked exceptions must be:', opts: ['Always thrown upward', 'Caught or declared with throws clause', 'Only caught, never declared', 'Treated as unchecked'], ans: 1 },
    { q: 'finally block executes:', opts: ['Only when no exception occurs', 'Only when an exception occurs', 'Always (except System.exit() / JVM crash)', 'Never guaranteed'], ans: 2 },
    { q: 'NullPointerException is a:', opts: ['Checked exception', 'Unchecked RuntimeException', 'Error class subtype', 'Custom application exception'], ans: 1 },
    { q: 'try-with-resources automatically:', opts: ['Swallows all exceptions silently', 'Closes resources implementing AutoCloseable after try block', 'Rethrows all exceptions', 'Logs all errors'], ans: 1 },
  ],
  CUSTOM_EX: [
    { q: 'To create a CHECKED custom exception, extend:', opts: ['RuntimeException', 'Error', 'Exception', 'Throwable directly'], ans: 2 },
    { q: 'Custom exception message is provided via:', opts: ['super(message) in constructor', 'A public field named "message"', 'Setter method only', 'Compile-time annotation'], ans: 0 },
    { q: 'Custom UNCHECKED exception extends:', opts: ['Exception', 'RuntimeException', 'Throwable', 'Error'], ans: 1 },
    { q: 'throws keyword in method signature declares:', opts: ['Method catches exception internally', 'Method may propagate this checked exception to caller', 'Method has try-catch block', 'Exception is unchecked'], ans: 1 },
    { q: 'Multi-catch syntax (Java 7+):', opts: ['catch(Ex1 | Ex2 e)', 'catch(Ex1, Ex2 e)', 'catch<Ex1, Ex2> e', 'catch[Ex1 | Ex2]'], ans: 0 },
  ],
  JAVA_COLLECTIONS: [
    { q: 'ArrayList vs LinkedList: O(1) random access is only in:', opts: ['LinkedList', 'Both', 'ArrayList', 'Neither'], ans: 2 },
    { q: 'HashMap allows:', opts: ['No null keys or values', 'One null key + multiple null values', 'Only String keys', 'Sorted keys only'], ans: 1 },
    { q: 'TreeSet stores elements in:', opts: ['Insertion order', 'Random/hash order', 'Sorted natural or comparator order', 'Access-frequency order'], ans: 2 },
    { q: 'Which thread-safe collection blocks producer when full and consumer when empty?', opts: ['ArrayList', 'HashMap', 'BlockingQueue', 'LinkedList'], ans: 2 },
    { q: 'Calling Collection.remove() while iterating with Iterator causes:', opts: ['Silent success', 'ConcurrentModificationException (use Iterator.remove() instead)', 'Duplicate removal', 'No effect'], ans: 1 },
  ],
};

function computeNodeState(node: FlatNode, nodeMap: Record<string, FlatNode>): 'locked' | 'at_risk' | 'progressing' | 'strong' {
  const isLocked = node.prerequisites.some(pid => (nodeMap[pid]?.masteryScore ?? 0) < LOCK_THRESHOLD);
  if (isLocked && node.masteryScore === 0) return 'locked';
  if (node.masteryScore >= 80) return 'strong';
  if (node.masteryScore >= 50) return 'progressing';
  return 'at_risk';
}

function getLEDClass(score: number): string {
  if (score >= 80) return 'bg-emerald-500 shadow-[0_0_8px_#10b981]';
  if (score >= 50) return 'bg-amber-500 shadow-[0_0_8px_#f59e0b]';
  if (score > 0)  return 'bg-cyan-600/60';
  return 'bg-blue-500 shadow-[0_0_8px_#3b82f6]';
}

function getNodeHighlight(
  nodeId: string,
  hoveredNodeId: string | null,
  hoveredPrereqs: string[],
): NodeHighlight {
  if (!hoveredNodeId) return 'normal';
  if (nodeId === hoveredNodeId) return 'active';
  if (hoveredPrereqs.includes(nodeId)) return 'prereq';
  return 'muted';
}

function computeUnitHealth(unit: RawUnit): number {
  if (unit.nodes.length === 0) return 0;
  return Math.round(unit.nodes.reduce((s, n) => s + n.masteryScore, 0) / unit.nodes.length);
}

const SUBJECT_COLORS: Record<SubjectKey, string> = {
  DSA: '#6366F1', DBMS: '#22d3ee', OS: '#a78bfa', CN: '#34d399', OOP: '#f59e0b',
};

const CoverageWheel: React.FC<{ mastery: number; color: string; code: string }> = ({ mastery, color, code }) => {
  const size = 88;
  const r = 34;
  const circ = 2 * Math.PI * r;
  const offset = circ - (mastery / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono-data font-bold text-white" style={{ fontSize: '1.15rem', lineHeight: 1 }}>{mastery}%</span>
          <span style={{ color: '#64748B', fontSize: '0.45rem', fontWeight: 700, letterSpacing: '0.1em', marginTop: 2 }}>MASTERY</span>
        </div>
      </div>
      <span style={{ color, fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em' }}>{code}</span>
    </div>
  );
};

const NodeCard: React.FC<{
  node: FlatNode;
  nodeMap: Record<string, FlatNode>;
  highlight: NodeHighlight;
  onHover: (id: string | null) => void;
  onQuiz: (id: string) => void;
}> = ({ node, nodeMap, highlight, onHover, onQuiz }) => {
  const state = computeNodeState(node, nodeMap);
  const isLocked = state === 'locked';
  const [showTooltip, setShowTooltip] = useState(false);

  const borderStyle = (): React.CSSProperties => {
    if (highlight === 'active') return { border: '1.5px solid #f59e0b', boxShadow: '0 0 14px rgba(245,158,11,0.45)' };
    if (highlight === 'prereq') return { border: '1.5px solid #22d3ee', boxShadow: '0 0 12px rgba(34,211,238,0.4)' };
    if (highlight === 'muted') return { border: '1px solid rgba(255,255,255,0.05)', opacity: 0.25 };
    return { border: '1px solid rgba(255,255,255,0.08)' };
  };

  const blockingPrereqs = node.prerequisites
    .map(pid => nodeMap[pid])
    .filter(p => p && p.masteryScore < LOCK_THRESHOLD);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-xl p-3 cursor-pointer"
      style={{
        background: 'rgba(255,255,255,0.025)',
        transition: 'border 180ms, box-shadow 180ms, opacity 300ms',
        ...borderStyle(),
      }}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
    >
      {isLocked && (
        <div
          className="absolute inset-0 rounded-xl z-10 flex flex-col items-center justify-center gap-1.5"
          style={{ background: 'rgba(6,9,18,0.75)', backdropFilter: 'blur(4px)' }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <Lock className="w-4 h-4" style={{ color: '#f59e0b' }} />
          <span style={{ color: '#f59e0b', fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.08em' }}>LOCKED</span>
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute bottom-full mb-2 left-0 right-0 mx-1 p-2 rounded-lg z-20"
                style={{ background: '#0f172a', border: '1px solid rgba(245,158,11,0.3)', fontSize: '0.58rem', color: '#fcd34d', lineHeight: 1.5 }}
              >
                {blockingPrereqs.map(p => (
                  <div key={p.id}>• {p.name}: {p.masteryScore}% (need ≥{LOCK_THRESHOLD}%)</div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="flex items-start gap-2.5">
        <div className="flex flex-col items-center gap-1.5 pt-0.5">
          <div className={`w-2 h-2 rounded-full shrink-0 ${getLEDClass(node.masteryScore)}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold leading-tight" style={{ fontSize: '0.7rem' }}>{node.name}</p>
          <div className="flex items-center gap-1 mt-1 flex-wrap">
            {node.prerequisites.slice(0, 2).map(pid => (
              <span key={pid}
                className="px-1.5 py-0.5 rounded text-xs font-mono-data"
                style={{ fontSize: '0.44rem', background: 'rgba(255,255,255,0.06)', color: '#64748B' }}
              >
                {nodeMap[pid]?.name?.split(' ')[0] ?? pid}
              </span>
            ))}
            {node.prerequisites.length > 2 && (
              <span style={{ fontSize: '0.44rem', color: '#475569' }}>+{node.prerequisites.length - 2}</span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="font-mono-data font-bold" style={{ fontSize: '0.7rem', color: node.masteryScore >= 80 ? '#34d399' : node.masteryScore >= 50 ? '#f59e0b' : '#94A3B8' }}>
            {node.masteryScore}%
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); if (!isLocked) onQuiz(node.id); }}
            disabled={isLocked}
            className="w-5 h-5 rounded-md flex items-center justify-center transition-colors"
            style={{
              background: isLocked ? 'rgba(255,255,255,0.03)' : 'rgba(99,102,241,0.15)',
              border: `1px solid ${isLocked ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.35)'}`,
              cursor: isLocked ? 'not-allowed' : 'pointer',
            }}
          >
            <ChevronRight className="w-3 h-3" style={{ color: isLocked ? '#334155' : '#a5b4fc' }} />
          </button>
        </div>
      </div>

      <div className="mt-2.5">
        <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: node.masteryScore >= 80 ? '#34d399' : node.masteryScore >= 50 ? '#f59e0b' : '#6366F1' }}
            initial={{ width: 0 }}
            animate={{ width: `${node.masteryScore}%` }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-2">
        <span
          className="px-1.5 py-0.5 rounded text-xs font-bold"
          style={{
            fontSize: '0.44rem',
            background: node.weightage === 'High' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
            color: node.weightage === 'High' ? '#f87171' : '#fcd34d',
          }}
        >
          {node.weightage}
        </span>
        <span style={{ fontSize: '0.44rem', color: '#475569', fontWeight: 600 }}>{node.estimatedExamMarks}M</span>
      </div>
    </motion.div>
  );
};

const MicroQuizOverlay: React.FC<{
  nodeId: string;
  nodeMap: Record<string, FlatNode>;
  onClose: () => void;
}> = ({ nodeId, nodeMap, onClose }) => {
  const node = nodeMap[nodeId];
  const questions = QB[nodeId] ?? [];
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(5).fill(null));
  const [revealed, setRevealed] = useState(false);

  const currentQ = questions[step];
  const score = answers.filter((a, i) => a !== null && a === questions[i]?.ans).length;
  const allAnswered = answers.every(a => a !== null);
  const isFinished = step >= questions.length;

  const handleSelect = (idx: number) => {
    if (revealed) return;
    const newA = [...answers];
    newA[step] = idx;
    setAnswers(newA);
    setRevealed(true);
  };

  const handleNext = () => {
    setRevealed(false);
    if (step < questions.length - 1) setStep(step + 1);
    else setStep(questions.length);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex-1" onClick={onClose} style={{ background: 'rgba(0,0,0,0.5)' }} />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: '0%' }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-96 flex flex-col overflow-hidden"
        style={{ background: '#0a0f1e', borderLeft: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <p style={{ color: '#64748B', fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Mock Quiz · 5 Questions</p>
            <p className="text-white font-bold text-sm mt-0.5">{node?.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="flex gap-1 px-5 pt-4">
          {questions.map((_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full" style={{ background: i < step ? '#6366F1' : i === step ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.07)' }} />
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {isFinished ? (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6 pt-8">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: score >= 4 ? 'rgba(52,211,153,0.12)' : score >= 3 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)', border: `2px solid ${score >= 4 ? '#34d399' : score >= 3 ? '#f59e0b' : '#ef4444'}` }}>
                <span className="font-mono-data font-bold text-white text-2xl">{score}/5</span>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-lg">{score >= 4 ? 'Excellent!' : score >= 3 ? 'Good Effort' : 'Needs Review'}</p>
                <p style={{ color: '#64748B', fontSize: '0.75rem', marginTop: 6 }}>
                  {score >= 4 ? 'Strong command of this topic.' : score >= 3 ? 'Review the missed concepts.' : 'Revisit this topic in depth.'}
                </p>
              </div>
              {answers.map((a, i) => (
                <div key={i} className="w-full p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${a === questions[i].ans ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                  <div className="flex items-start gap-2">
                    {a === questions[i].ans
                      ? <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: '#34d399' }} />
                      : <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
                    }
                    <p style={{ color: '#94A3B8', fontSize: '0.65rem', lineHeight: 1.5 }}>{questions[i].q}</p>
                  </div>
                  {a !== questions[i].ans && (
                    <p style={{ color: '#34d399', fontSize: '0.6rem', marginTop: 4, marginLeft: 18 }}>✓ {questions[i].opts[questions[i].ans]}</p>
                  )}
                </div>
              ))}
              <button onClick={onClose} className="w-full py-3 rounded-xl font-bold text-sm" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }}>
                Close Session
              </button>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <p style={{ color: '#64748B', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 12 }}>
                  QUESTION {step + 1} OF {questions.length}
                </p>
                <p className="text-white font-semibold mb-6" style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>{currentQ?.q}</p>
                <div className="space-y-2.5">
                  {currentQ?.opts.map((opt, i) => {
                    const selected = answers[step] === i;
                    const isCorrect = i === currentQ.ans;
                    const showResult = revealed;
                    let bg = 'rgba(255,255,255,0.03)';
                    let border = 'rgba(255,255,255,0.08)';
                    let textColor = '#94A3B8';
                    if (showResult && isCorrect) { bg = 'rgba(52,211,153,0.1)'; border = 'rgba(52,211,153,0.4)'; textColor = '#34d399'; }
                    else if (showResult && selected && !isCorrect) { bg = 'rgba(239,68,68,0.1)'; border = 'rgba(239,68,68,0.4)'; textColor = '#f87171'; }
                    else if (!showResult && selected) { bg = 'rgba(99,102,241,0.12)'; border = 'rgba(99,102,241,0.4)'; textColor = '#a5b4fc'; }
                    return (
                      <button
                        key={i}
                        onClick={() => handleSelect(i)}
                        className="w-full text-left px-4 py-3 rounded-xl transition-all"
                        style={{ background: bg, border: `1px solid ${border}`, color: textColor, fontSize: '0.75rem', fontWeight: 500, lineHeight: 1.4 }}
                      >
                        <span className="font-mono-data mr-2" style={{ fontSize: '0.65rem', opacity: 0.6 }}>{['A', 'B', 'C', 'D'][i]}.</span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {revealed && (
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleNext}
                    className="w-full mt-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                    style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }}
                  >
                    {step < questions.length - 1 ? 'Next Question' : 'View Results'}
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const SyllabusCommandCenter: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState<SubjectKey>('DSA');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [quizNodeId, setQuizNodeId] = useState<string | null>(null);

  const activeSubject = SEMESTER_CURRICULUM[selectedSubject];
  const subjectColor = SUBJECT_COLORS[selectedSubject];

  const allNodes = useMemo<FlatNode[]>(() =>
    activeSubject.units.flatMap(u => u.nodes.map(n => ({ ...n, unitId: u.id, unitTitle: u.title }))),
    [activeSubject]
  );

  const nodeMap = useMemo<Record<string, FlatNode>>(() =>
    Object.fromEntries(allNodes.map(n => [n.id, n])),
    [allNodes]
  );

  const hoveredNode = hoveredNodeId ? nodeMap[hoveredNodeId] : null;
  const hoveredPrereqs: string[] = hoveredNode?.prerequisites ?? [];

  const showVulnerability = hoveredNode !== null &&
    hoveredPrereqs.some(pid => (nodeMap[pid]?.masteryScore ?? 0) < LOCK_THRESHOLD);

  const overallMastery = useMemo(() =>
    allNodes.length ? Math.round(allNodes.reduce((s, n) => s + n.masteryScore, 0) / allNodes.length) : 0,
    [allNodes]
  );

  const subjectKeys = Object.keys(SEMESTER_CURRICULUM) as SubjectKey[];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      className="min-h-screen flex flex-col"
      style={{ background: '#060912', fontFamily: 'Inter, sans-serif', color: '#e2e8f0' }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse 60% 40% at 50% 0%, ${subjectColor}0d 0%, transparent 55%)`,
        transition: 'background 400ms',
      }} />

      <div className="relative z-10 flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="karl-btn-ghost flex items-center gap-2 text-sm">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <div className="w-px h-5" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${subjectColor}20`, border: `1px solid ${subjectColor}40` }}>
              <Shield className="w-4 h-4" style={{ color: subjectColor }} />
            </div>
            <div>
              <p style={{ color: '#94A3B8', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                Aegis Core · Semester Map
              </p>
              <p className="text-white font-bold text-sm leading-tight">{activeSubject.subjectName}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/quiz-engine')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl font-semibold"
            style={{ background: `${subjectColor}18`, border: `1px solid ${subjectColor}40`, color: subjectColor, fontSize: '0.72rem' }}
          >
            <Zap className="w-3 h-3" /> Launch Quiz
          </motion.button>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between px-6 pt-5 pb-3">
        <div className="relative flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {subjectKeys.map(key => (
            <button
              key={key}
              onClick={() => { setSelectedSubject(key); setHoveredNodeId(null); }}
              className="relative px-4 py-2 rounded-lg text-xs font-bold z-10 transition-colors"
              style={{ color: selectedSubject === key ? '#fff' : '#64748B', minWidth: 52 }}
            >
              {selectedSubject === key && (
                <motion.div
                  layoutId="subject-tab-indicator"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: SUBJECT_COLORS[key] }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{key}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p style={{ color: '#64748B', fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {activeSubject.subjectCode} · {allNodes.length} Topics
            </p>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span style={{ color: '#64748B', fontSize: '0.52rem' }}>{allNodes.filter(n => n.masteryScore >= 80).length} Strong</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span style={{ color: '#64748B', fontSize: '0.52rem' }}>{allNodes.filter(n => n.masteryScore >= 50 && n.masteryScore < 80).length} Progress</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#3b82f6' }} />
                <span style={{ color: '#64748B', fontSize: '0.52rem' }}>{allNodes.filter(n => n.masteryScore === 0).length} Not Started</span>
              </div>
            </div>
          </div>
          <CoverageWheel mastery={overallMastery} color={subjectColor} code={activeSubject.subjectCode} />
        </div>
      </div>

      <AnimatePresence>
        {showVulnerability && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="relative z-10 mx-6 mb-0"
          >
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: '#ef4444' }} />
              <span style={{ color: '#fca5a5', fontSize: '0.65rem', fontWeight: 600 }}>
                ⚠️ CRITICAL FOUNDATIONAL VULNERABILITY DETECTED — prerequisite mastery below {LOCK_THRESHOLD}% will block advanced topics.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex-1 px-6 pb-6 pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedSubject}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-5 gap-4 w-full items-start"
          >
            {activeSubject.units.map((unit, colIdx) => {
              const health = computeUnitHealth(unit);
              const healthColor = health >= 70 ? '#34d399' : health >= 40 ? '#f59e0b' : '#6366F1';
              return (
                <motion.div
                  key={unit.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: colIdx * 0.06, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col gap-3"
                >
                  <div className="pb-3" style={{ borderBottom: `2px solid ${subjectColor}30` }}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span style={{ color: subjectColor, fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.12em' }}>
                        {unit.id.replace('_', ' ')}
                      </span>
                      <span className="font-mono-data font-bold" style={{ color: healthColor, fontSize: '0.72rem' }}>{health}%</span>
                    </div>
                    <p className="text-white font-semibold" style={{ fontSize: '0.65rem', lineHeight: 1.3 }}>{unit.title}</p>
                    <div className="mt-2 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: healthColor }}
                        initial={{ width: 0 }}
                        animate={{ width: `${health}%` }}
                        transition={{ duration: 0.7, delay: colIdx * 0.08 }}
                      />
                    </div>
                    <p style={{ color: '#475569', fontSize: '0.48rem', marginTop: 4 }}>{unit.nodes.length} topic{unit.nodes.length !== 1 ? 's' : ''}</p>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {unit.nodes.map(rawNode => {
                      const flatNode = nodeMap[rawNode.id];
                      if (!flatNode) return null;
                      const highlight = getNodeHighlight(rawNode.id, hoveredNodeId, hoveredPrereqs);
                      return (
                        <NodeCard
                          key={rawNode.id}
                          node={flatNode}
                          nodeMap={nodeMap}
                          highlight={highlight}
                          onHover={setHoveredNodeId}
                          onQuiz={setQuizNodeId}
                        />
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {quizNodeId && nodeMap[quizNodeId] && (
          <MicroQuizOverlay
            key={quizNodeId}
            nodeId={quizNodeId}
            nodeMap={nodeMap}
            onClose={() => setQuizNodeId(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SyllabusCommandCenter;
