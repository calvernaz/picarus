Annotation
==========
Every row in the Redis annotation db's is prefixed with the annotation task as a namespace (e.g., <task>:<row>).  Below is a table of the Redis db's used for annotation, all run on a single Redis server.  

+--------------+------------------------------------------------------------------------------------------------------+
| Redis DB     | Description                                                                                          |
+--------------+------------------------------------------------------------------------------------------------------+
| users        |                                                                                                      |
+--------------+------------------------------------------------------------------------------------------------------+
| response     |                                                                                                      |
+--------------+------------------------------------------------------------------------------------------------------+
| state        |                                                                                                      |
+--------------+------------------------------------------------------------------------------------------------------+
| key_to_path  | Maps from a random key to a b64(row) + ' ' + b64(column)                                             |
+--------------+------------------------------------------------------------------------------------------------------+
| path_to_key  | Maps from b64(row) + ' ' + b64(column) to a random key                                               |
+--------------+------------------------------------------------------------------------------------------------------+


The state is the global memory of the task as it is being executed.  Below is a table of the state rows.

+--------------------+------------------------------------------------------------------------------------------------------+
| State Row          | Description                                                                                          |
+--------------------+------------------------------------------------------------------------------------------------------+
| <task>:rows        | PQ of rows, user view reduces priority.  Determines which row to show next.                          |
+--------------------+------------------------------------------------------------------------------------------------------+
| <task>:seen:<user> | Set of rows user has seen.                                                                           |
+--------------------+------------------------------------------------------------------------------------------------------+
| <task>:data_lock   | Lock needed to mutate state/key_to_path/path_to_key                                                  |
+--------------------+------------------------------------------------------------------------------------------------------+
