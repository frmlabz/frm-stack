import { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { useApi } from "#lib/api";
import { useSession } from "#providers/session-provider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const TodosList = () => {
  const { data: session } = useSession();
  const api = useApi();
  const queryClient = useQueryClient();

  const userId = session?.user?.id;

  const [newTitle, setNewTitle] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const completedFilter = useMemo(() => {
    if (filter === "active") return false;
    if (filter === "completed") return true;
    return undefined;
  }, [filter]);

  const todosQuery = useQuery({
    ...api.todo.list.queryOptions({
      input: { completed: completedFilter },
    }),
    enabled: Boolean(userId),
  });

  const createTodoMutation = useMutation({
    ...api.todo.create.mutationOptions(),
    onSuccess: async () => {
      setNewTitle("");
      await queryClient.invalidateQueries({ queryKey: api.todo.key() });
    },
    onError: (e: Error) => {
      Alert.alert("Error", `Failed to create todo: ${e.message}`);
    },
  });

  const updateTodoMutation = useMutation({
    ...api.todo.update.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: api.todo.key() });
    },
    onError: (e: Error) => {
      Alert.alert("Error", `Failed to update todo: ${e.message}`);
    },
  });

  const deleteTodoMutation = useMutation({
    ...api.todo.delete.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: api.todo.key() });
    },
    onError: (e: Error) => {
      Alert.alert("Error", `Failed to delete todo: ${e.message}`);
    },
  });

  const todos = (todosQuery.data ?? []) as {
    id: string;
    title: string;
    completed: boolean;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  }[];

  const handleAddTodo = () => {
    const title = newTitle.trim();
    if (!title) return;
    createTodoMutation.mutate({ title });
  };

  const handleToggleTodo = (id: string, completed: boolean) => {
    updateTodoMutation.mutate({ id, completed: !completed });
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    const title = editingTitle.trim();
    if (!title) return;
    updateTodoMutation.mutate({ id: editingId, title });
    setEditingId(null);
    setEditingTitle("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Todo", "Are you sure you want to delete this todo?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteTodoMutation.mutate({ id }) },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Todos</Text>
        <Text style={styles.description}>
          A tiny full-stack CRUD demo (oRPC + React Query + Kysely)
        </Text>

        <View style={styles.content}>
          <View style={styles.addSection}>
            <TextInput
              style={styles.input}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Add a todo…"
              editable={!createTodoMutation.isPending}
            />
            <TouchableOpacity
              style={[
                styles.button,
                (createTodoMutation.isPending || !newTitle.trim()) && styles.buttonDisabled,
              ]}
              onPress={handleAddTodo}
              disabled={createTodoMutation.isPending || !newTitle.trim()}>
              {createTodoMutation.isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Add</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.filterSection}>
            <TouchableOpacity
              style={[styles.filterButton, filter === "all" && styles.filterButtonActive]}
              onPress={() => setFilter("all")}>
              <Text
                style={[
                  styles.filterButtonText,
                  filter === "all" && styles.filterButtonTextActive,
                ]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === "active" && styles.filterButtonActive]}
              onPress={() => setFilter("active")}>
              <Text
                style={[
                  styles.filterButtonText,
                  filter === "active" && styles.filterButtonTextActive,
                ]}>
                Active
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === "completed" && styles.filterButtonActive]}
              onPress={() => setFilter("completed")}>
              <Text
                style={[
                  styles.filterButtonText,
                  filter === "completed" && styles.filterButtonTextActive,
                ]}>
                Completed
              </Text>
            </TouchableOpacity>
          </View>

          {todosQuery.isLoading && (
            <View style={styles.centerContainer}>
              <ActivityIndicator />
              <Text style={styles.loadingText}>Loading…</Text>
            </View>
          )}

          {todosQuery.error && (
            <Text style={styles.errorText}>
              Failed to load todos: {(todosQuery.error as Error).message}
            </Text>
          )}

          {todos.length === 0 && !todosQuery.isLoading && (
            <Text style={styles.emptyText}>No todos yet.</Text>
          )}

          <View style={styles.todosList}>
            {todos.map(todo => {
              const isEditing = editingId === todo.id;
              return (
                <View key={todo.id} style={styles.todoItem}>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => handleToggleTodo(todo.id, todo.completed)}
                    disabled={updateTodoMutation.isPending}>
                    <View style={[styles.checkboxInner, todo.completed && styles.checkboxChecked]}>
                      {todo.completed && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                  </TouchableOpacity>

                  <View style={styles.todoContent}>
                    {isEditing ? (
                      <TextInput
                        style={styles.editInput}
                        value={editingTitle}
                        onChangeText={setEditingTitle}
                        autoFocus
                      />
                    ) : (
                      <Text style={[styles.todoText, todo.completed && styles.todoTextCompleted]}>
                        {todo.title}
                      </Text>
                    )}
                  </View>

                  <View style={styles.todoActions}>
                    {isEditing ? (
                      <>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={handleSaveEdit}
                          disabled={!editingTitle.trim() || updateTodoMutation.isPending}>
                          <Text style={styles.actionButtonText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={handleCancelEdit}>
                          <Text style={styles.actionButtonText}>Cancel</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => {
                            setEditingId(todo.id);
                            setEditingTitle(todo.title);
                          }}>
                          <Text style={styles.actionButtonText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.deleteButton]}
                          onPress={() => handleDelete(todo.id)}
                          disabled={deleteTodoMutation.isPending}>
                          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                            Delete
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  card: {
    margin: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  content: {
    gap: 16,
  },
  addSection: {
    flexDirection: "row",
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  editInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  filterSection: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  filterButtonActive: {
    backgroundColor: "#007AFF",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#333",
  },
  filterButtonTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  centerContainer: {
    alignItems: "center",
    padding: 16,
  },
  loadingText: {
    marginTop: 8,
    color: "#666",
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 14,
  },
  emptyText: {
    color: "#666",
    fontSize: 14,
  },
  todosList: {
    gap: 8,
  },
  todoItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    gap: 12,
  },
  checkbox: {
    padding: 4,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#007AFF",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#007AFF",
  },
  checkmark: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  todoContent: {
    flex: 1,
  },
  todoText: {
    fontSize: 16,
  },
  todoTextCompleted: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  todoActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#007AFF",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  deleteButton: {
    backgroundColor: "#ff3b30",
  },
  deleteButtonText: {
    color: "#fff",
  },
});
