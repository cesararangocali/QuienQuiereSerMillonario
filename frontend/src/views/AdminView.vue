<template>
  <v-container class="admin-container">
    <!-- Login Form si no está autenticado -->
    <div v-if="!isAuthenticated" class="login-section">
      <v-card class="login-card qqss-ring" elevation="20" max-width="500" mx-auto>
        <div class="login-header">
          <v-icon icon="mdi-shield-crown" size="60" color="warning" class="login-icon" />
          <h1 class="login-title">Panel de Administración</h1>
          <p class="login-subtitle">Acceso restringido</p>
        </div>

        <v-card-text class="login-form">
          <v-form @submit.prevent="login" ref="loginForm">
            <v-text-field
              v-model="credentials.username"
              label="Usuario Administrador"
              type="text"
              prepend-inner-icon="mdi-account"
              variant="outlined"
              class="mb-4"
              :rules="usernameRules"
              required
              :disabled="loading"
            ></v-text-field>

            <v-text-field
              v-model="credentials.password"
              label="Contraseña"
              :type="showPassword ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock"
              :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append-inner="showPassword = !showPassword"
              variant="outlined"
              class="mb-4"
              :rules="passwordRules"
              required
              :disabled="loading"
            ></v-text-field>

            <v-alert 
              v-if="loginError" 
              type="error" 
              class="mb-4"
              closable
              @click:close="loginError = ''"
            >
              {{ loginError }}
            </v-alert>

            <v-btn
              type="submit"
              color="warning"
              size="large"
              block
              class="login-btn qqss-ring"
              :loading="loading"
              prepend-icon="mdi-login"
            >
              Iniciar Sesión
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </div>

    <!-- Panel de Administración si está autenticado -->
    <div v-else class="admin-panel">
      <!-- Header del panel -->
      <v-card class="admin-header qqss-ring" elevation="12">
        <v-card-title class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon icon="mdi-shield-crown" size="40" color="warning" class="mr-3" />
            <div>
              <h1 class="admin-title">Panel de Administración</h1>
              <p class="admin-welcome">Bienvenido, {{ user?.name || 'Administrador' }}</p>
            </div>
          </div>
          <v-btn 
            color="error" 
            variant="outlined" 
            @click="logout"
            prepend-icon="mdi-logout"
          >
            Cerrar Sesión
          </v-btn>
        </v-card-title>
      </v-card>

      <!-- Tabs de funcionalidades -->
      <v-tabs v-model="activeTab" class="mt-4" color="warning" bg-color="transparent">
        <v-tab value="ranking">
          <v-icon start>mdi-trophy</v-icon>
          Ranking
        </v-tab>
        <v-tab value="questions">
          <v-icon start>mdi-help</v-icon>
          Preguntas
        </v-tab>
        <v-tab value="prayers">
          <v-icon start>mdi-hands-pray</v-icon>
          Oraciones
        </v-tab>
        <v-tab value="game">
          <v-icon start>mdi-gamepad-variant</v-icon>
          Control de Juego
        </v-tab>
      </v-tabs>

      <v-window v-model="activeTab" class="mt-4">
        <!-- Tab de Ranking -->
        <v-window-item value="ranking">
          <v-card class="qqss-ring" elevation="8">
            <v-card-title>
              <v-icon start>mdi-trophy</v-icon>
              Gestión de Ranking
            </v-card-title>
            <v-card-text>
              <div class="d-flex justify-space-between align-center mb-4">
                <h3>Top Jugadores</h3>
                <v-btn 
                  color="error" 
                  variant="outlined" 
                  @click="showResetRankingDialog = true"
                  :loading="loadingReset"
                  prepend-icon="mdi-refresh"
                >
                  Reiniciar Ranking
                </v-btn>
              </div>
              
              <v-data-table
                :headers="rankingHeaders"
                :items="ranking"
                :loading="loadingRanking"
                class="elevation-4"
                no-data-text="No hay jugadores en el ranking"
              >
                <template v-slot:item.playerName="{ item }">
                  <div class="d-flex align-center">
                    <v-icon 
                      v-if="item.index === 0" 
                      icon="mdi-crown" 
                      color="warning" 
                      class="mr-2" 
                    />
                    <span class="font-weight-bold">{{ item.playerName }}</span>
                  </div>
                </template>
                <template v-slot:item.points="{ item }">
                  <v-chip 
                    :color="getPlayerColor(item.index)" 
                    variant="elevated"
                  >
                    {{ item.points.toLocaleString() }} pts
                  </v-chip>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-window-item>

        <!-- Tab de Preguntas -->
        <v-window-item value="questions">
          <v-card class="qqss-ring" elevation="8">
            <v-card-title>
              <v-icon start>mdi-help</v-icon>
              Gestión de Preguntas
            </v-card-title>
            <v-card-text>
              <div class="d-flex justify-space-between align-center mb-4">
                <h3>Preguntas del Juego ({{ questions.length }} total)</h3>
                <div class="d-flex ga-2">
                  <v-btn 
                    color="warning" 
                    variant="elevated" 
                    @click="showNewQuestionDialog = true"
                    prepend-icon="mdi-plus"
                  >
                    Nueva Pregunta
                  </v-btn>
                </div>
              </div>
              
              <v-data-table
                :headers="questionHeaders"
                :items="questions"
                :loading="loadingQuestions"
                class="elevation-4"
                no-data-text="No hay preguntas registradas"
                items-per-page="10"
              >
                <template v-slot:item.text="{ item }">
                  <div class="text-truncate" style="max-width: 300px;">
                    {{ item.text }}
                  </div>
                </template>
                <template v-slot:item.difficulty="{ item }">
                  <v-chip 
                    :color="getDifficultyColor(item.difficulty)" 
                    variant="elevated"
                    size="small"
                  >
                    Nivel {{ item.difficulty }}
                  </v-chip>
                </template>
                <template v-slot:item.actions="{ item }">
                  <div class="d-flex ga-1">
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      color="primary"
                      variant="text"
                      @click="editQuestion(item)"
                    />
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      color="error"
                      variant="text"
                      @click="deleteQuestion(item)"
                    />
                  </div>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-window-item>

        <!-- Tab de Oraciones -->
        <v-window-item value="prayers">
          <v-card class="qqss-ring" elevation="8">
            <v-card-title>
              <v-icon start>mdi-hands-pray</v-icon>
              Gestión de Oraciones
            </v-card-title>
            <v-card-text>
              <div class="d-flex justify-space-between align-center mb-4">
                <h3>Oraciones Disponibles ({{ prayers.length }} total)</h3>
                <v-btn 
                  color="warning" 
                  variant="elevated" 
                  @click="showNewPrayerDialog = true"
                  prepend-icon="mdi-plus"
                >
                  Nueva Oración
                </v-btn>
              </div>
              
              <v-data-table
                :headers="prayerHeaders"
                :items="prayers"
                :loading="loadingPrayers"
                class="elevation-4"
                no-data-text="No hay oraciones registradas"
              >
                <template v-slot:item.text="{ item }">
                  <div class="text-truncate" style="max-width: 400px;">
                    {{ item.text }}
                  </div>
                </template>
                <template v-slot:item.actions="{ item }">
                  <div class="d-flex ga-1">
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      color="primary"
                      variant="text"
                      @click="editPrayer(item)"
                    />
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      color="error"
                      variant="text"
                      @click="deletePrayer(item)"
                    />
                  </div>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-window-item>

        <!-- Tab de Control de Juego -->
        <v-window-item value="game">
          <v-card class="qqss-ring" elevation="8">
            <v-card-title>
              <v-icon start>mdi-gamepad-variant</v-icon>
              Control del Juego
            </v-card-title>
            <v-card-text>
              <div class="game-controls">
                <v-card class="control-card" elevation="4">
                  <v-card-title>Estado del Juego</v-card-title>
                  <v-card-text>
                    <div class="d-flex align-center mb-4">
                      <v-icon 
                        :icon="gameStatus.locked ? 'mdi-lock' : 'mdi-lock-open'" 
                        :color="gameStatus.locked ? 'error' : 'success'"
                        size="40"
                        class="mr-3"
                      />
                      <div>
                        <h3>{{ gameStatus.locked ? 'Juego Bloqueado' : 'Juego Activo' }}</h3>
                        <p>{{ gameStatus.locked ? 'Los usuarios no pueden jugar' : 'Los usuarios pueden jugar normalmente' }}</p>
                      </div>
                    </div>
                    
                    <div class="d-flex ga-2">
                      <v-btn 
                        v-if="!gameStatus.locked"
                        color="error" 
                        @click="showLockDialog = true"
                        prepend-icon="mdi-lock"
                      >
                        Bloquear Juego
                      </v-btn>
                      <v-btn 
                        v-else
                        color="success" 
                        @click="showUnlockDialog = true"
                        prepend-icon="mdi-lock-open"
                      >
                        Desbloquear Juego
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </v-card-text>
          </v-card>
        </v-window-item>
      </v-window>
    </div>

    <!-- Dialogs para bloquear/desbloquear juego -->
    <v-dialog v-model="showLockDialog" max-width="400">
      <v-card>
        <v-card-title>Bloquear Juego</v-card-title>
        <v-card-text>
          <p>Ingresa el PIN para bloquear el juego:</p>
          <v-text-field
            v-model="gamePin"
            label="PIN de Administrador"
            type="password"
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showLockDialog = false">Cancelar</v-btn>
          <v-btn color="error" @click="lockGame">Bloquear</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showUnlockDialog" max-width="400">
      <v-card>
        <v-card-title>Desbloquear Juego</v-card-title>
        <v-card-text>
          <p>Ingresa el PIN para desbloquear el juego:</p>
          <v-text-field
            v-model="gamePin"
            label="PIN de Administrador"
            type="password"
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showUnlockDialog = false">Cancelar</v-btn>
          <v-btn color="success" @click="unlockGame">Desbloquear</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog para crear nueva pregunta -->
    <v-dialog v-model="showNewQuestionDialog" max-width="650" persistent>
      <v-card class="qqss-ring" elevation="16">
        <v-card-title class="bg-warning text-white d-flex align-center pa-4">
          <v-icon start size="28" color="white">mdi-plus-circle</v-icon>
          <span class="text-h5 font-weight-bold">Nueva Pregunta</span>
          <v-spacer />
          <v-btn
            icon="mdi-close"
            size="small"
            variant="text"
            color="white"
            @click="showNewQuestionDialog = false"
          />
        </v-card-title>
        
        <v-card-text class="pa-6">
          <v-form @submit.prevent="createQuestion" ref="questionForm">
            <!-- Pregunta y configuración básica -->
            <v-row class="mb-2">
              <v-col cols="12">
                <v-textarea
                  v-model="newQuestion.text"
                  label="Pregunta"
                  variant="outlined"
                  rows="2"
                  :rules="[v => !!v || 'La pregunta es obligatoria']"
                  required
                  auto-grow
                />
              </v-col>
            </v-row>

            <v-row class="mb-2">
              <v-col cols="6">
                <v-select
                  v-model="newQuestion.difficulty"
                  label="Dificultad"
                  :items="[
                    { title: 'Nivel 1', value: 1 },
                    { title: 'Nivel 2', value: 2 },
                    { title: 'Nivel 3', value: 3 },
                    { title: 'Nivel 4', value: 4 },
                    { title: 'Nivel 5', value: 5 },
                    { title: 'Nivel 6', value: 6 },
                    { title: 'Nivel 7', value: 7 },
                    { title: 'Nivel 8', value: 8 },
                    { title: 'Nivel 9', value: 9 },
                    { title: 'Nivel 10', value: 10 },
                    { title: 'Nivel 11', value: 11 },
                    { title: 'Nivel 12', value: 12 },
                    { title: 'Nivel 13', value: 13 },
                    { title: 'Nivel 14', value: 14 },
                    { title: 'Nivel 15', value: 15 }
                  ]"
                  variant="outlined"
                  :rules="[v => !!v || 'La dificultad es obligatoria']"
                  required
                />
              </v-col>
              <v-col cols="6">
                <v-combobox
                  v-model="newQuestion.category"
                  label="Categoría"
                  :items="availableCategories"
                  variant="outlined"
                  placeholder="Selecciona o escribe nueva categoría"
                  chips
                  clearable
                />
              </v-col>
            </v-row>

            <!-- Opciones de respuesta en 2x2 -->
            <div class="mb-4">
              <label class="text-subtitle-1 mb-3 d-block font-weight-bold">Opciones de Respuesta:</label>
              <v-row>
                <v-col 
                  v-for="(option, index) in newQuestion.options" 
                  :key="index"
                  cols="6"
                >
                  <v-text-field
                    v-model="newQuestion.options[index]"
                    :label="`${String.fromCharCode(65 + index)}) Opción ${index + 1}`"
                    variant="outlined"
                    density="comfortable"
                    :rules="[v => !!v || `La opción ${index + 1} es obligatoria`]"
                    required
                  />
                </v-col>
              </v-row>
              
              <!-- Respuesta correcta -->
              <v-select
                v-model="newQuestion.correctIndex"
                label="Respuesta Correcta"
                :items="[
                  { title: 'A) Opción 1', value: 0 },
                  { title: 'B) Opción 2', value: 1 },
                  { title: 'C) Opción 3', value: 2 },
                  { title: 'D) Opción 4', value: 3 }
                ]"
                variant="outlined"
                class="mt-3"
                :rules="[v => v !== null && v !== undefined || 'Selecciona la respuesta correcta']"
                required
              />
            </div>

            <!-- Campos opcionales en acordeón -->
            <v-expansion-panels variant="accordion" class="mb-4">
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <v-icon start>mdi-cog</v-icon>
                  Configuración Adicional (Opcional)
                </v-expansion-panel-title>
                <v-expansion-panel-text class="pt-4">
                  <v-text-field
                    v-model="newQuestion.verseHint"
                    label="Pista Bíblica"
                    variant="outlined"
                    class="mb-3"
                    placeholder="Ej: Juan 3:16"
                    prepend-inner-icon="mdi-book-open-page-variant"
                  />
                  
                  <v-textarea
                    v-model="newQuestion.explanation"
                    label="Explicación"
                    variant="outlined"
                    class="mb-3"
                    rows="2"
                    placeholder="Explicación de la respuesta correcta"
                    prepend-inner-icon="mdi-information"
                    auto-grow
                  />
                  
                  <v-text-field
                    v-model="newQuestion.source"
                    label="Fuente"
                    variant="outlined"
                    placeholder="Referencia o fuente de la pregunta"
                    prepend-inner-icon="mdi-source-branch"
                  />
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="bg-grey-lighten-5 pa-4">
          <v-spacer />
          <v-btn 
            @click="resetQuestionForm(); showNewQuestionDialog = false" 
            variant="outlined"
            color="grey"
            prepend-icon="mdi-cancel"
          >
            Cancelar
          </v-btn>
          <v-btn 
            color="warning" 
            @click="createQuestion" 
            :loading="creatingQuestion"
            prepend-icon="mdi-content-save"
            variant="elevated"
            class="ml-2"
          >
            Guardar Pregunta
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog para editar pregunta -->
    <v-dialog v-model="showEditQuestionDialog" max-width="650" persistent>
      <v-card class="qqss-ring" elevation="16">
        <v-card-title class="bg-primary text-white d-flex align-center pa-4">
          <v-icon start size="28" color="white">mdi-pencil</v-icon>
          <span class="text-h5 font-weight-bold">Editar Pregunta</span>
          <v-spacer />
          <v-btn
            icon="mdi-close"
            size="small"
            variant="text"
            color="white"
            @click="showEditQuestionDialog = false"
          />
        </v-card-title>
        
        <v-card-text class="pa-6">
          <v-form @submit.prevent="updateQuestion" ref="editQuestionForm">
            <!-- Pregunta y configuración básica -->
            <v-row class="mb-2">
              <v-col cols="12">
                <v-textarea
                  v-model="editingQuestion.text"
                  label="Pregunta"
                  variant="outlined"
                  rows="2"
                  :rules="[v => !!v || 'La pregunta es obligatoria']"
                  required
                  auto-grow
                />
              </v-col>
            </v-row>

            <v-row class="mb-2">
              <v-col cols="6">
                <v-select
                  v-model="editingQuestion.difficulty"
                  label="Dificultad"
                  :items="[
                    { title: 'Nivel 1', value: 1 },
                    { title: 'Nivel 2', value: 2 },
                    { title: 'Nivel 3', value: 3 },
                    { title: 'Nivel 4', value: 4 },
                    { title: 'Nivel 5', value: 5 },
                    { title: 'Nivel 6', value: 6 },
                    { title: 'Nivel 7', value: 7 },
                    { title: 'Nivel 8', value: 8 },
                    { title: 'Nivel 9', value: 9 },
                    { title: 'Nivel 10', value: 10 },
                    { title: 'Nivel 11', value: 11 },
                    { title: 'Nivel 12', value: 12 },
                    { title: 'Nivel 13', value: 13 },
                    { title: 'Nivel 14', value: 14 },
                    { title: 'Nivel 15', value: 15 }
                  ]"
                  variant="outlined"
                  :rules="[v => !!v || 'La dificultad es obligatoria']"
                  required
                />
              </v-col>
              <v-col cols="6">
                <v-combobox
                  v-model="editingQuestion.category"
                  label="Categoría"
                  :items="availableCategories"
                  variant="outlined"
                  placeholder="Selecciona o escribe nueva categoría"
                  chips
                  clearable
                />
              </v-col>
            </v-row>

            <!-- Opciones de respuesta en 2x2 -->
            <div class="mb-4">
              <label class="text-subtitle-1 mb-3 d-block font-weight-bold">Opciones de Respuesta:</label>
              <v-row>
                <v-col 
                  v-for="(option, index) in editingQuestion.options" 
                  :key="index"
                  cols="6"
                >
                  <v-text-field
                    v-model="editingQuestion.options[index]"
                    :label="`${String.fromCharCode(65 + index)}) Opción ${index + 1}`"
                    variant="outlined"
                    density="comfortable"
                    :rules="[v => !!v || `La opción ${index + 1} es obligatoria`]"
                    required
                  />
                </v-col>
              </v-row>
              
              <!-- Respuesta correcta -->
              <v-select
                v-model="editingQuestion.correctIndex"
                label="Respuesta Correcta"
                :items="[
                  { title: 'A) Opción 1', value: 0 },
                  { title: 'B) Opción 2', value: 1 },
                  { title: 'C) Opción 3', value: 2 },
                  { title: 'D) Opción 4', value: 3 }
                ]"
                variant="outlined"
                class="mt-3"
                :rules="[v => v !== null && v !== undefined || 'Selecciona la respuesta correcta']"
                required
              />
            </div>

            <!-- Campos opcionales en acordeón -->
            <v-expansion-panels variant="accordion" class="mb-4">
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <v-icon start>mdi-cog</v-icon>
                  Configuración Adicional (Opcional)
                </v-expansion-panel-title>
                <v-expansion-panel-text class="pt-4">
                  <v-text-field
                    v-model="editingQuestion.verseHint"
                    label="Pista Bíblica"
                    variant="outlined"
                    class="mb-3"
                    placeholder="Ej: Juan 3:16"
                    prepend-inner-icon="mdi-book-open-page-variant"
                  />
                  
                  <v-textarea
                    v-model="editingQuestion.explanation"
                    label="Explicación"
                    variant="outlined"
                    class="mb-3"
                    rows="2"
                    placeholder="Explicación de la respuesta correcta"
                    prepend-inner-icon="mdi-information"
                    auto-grow
                  />
                  
                  <v-text-field
                    v-model="editingQuestion.source"
                    label="Fuente"
                    variant="outlined"
                    placeholder="Referencia o fuente de la pregunta"
                    prepend-inner-icon="mdi-source-branch"
                  />
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="bg-grey-lighten-5 pa-4">
          <v-spacer />
          <v-btn 
            @click="showEditQuestionDialog = false" 
            variant="outlined"
            color="grey"
            prepend-icon="mdi-cancel"
          >
            Cancelar
          </v-btn>
          <v-btn 
            color="primary" 
            @click="updateQuestion" 
            :loading="updatingQuestion"
            prepend-icon="mdi-content-save"
            variant="elevated"
            class="ml-2"
          >
            Actualizar Pregunta
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog para confirmar eliminación -->
    <v-dialog v-model="showDeleteQuestionDialog" max-width="400">
      <v-card class="qqss-ring" elevation="12">
        <v-card-title class="bg-error text-white d-flex align-center pa-4">
          <v-icon start color="white">mdi-delete-alert</v-icon>
          Eliminar Pregunta
        </v-card-title>
        <v-card-text class="pa-4">
          <p class="text-subtitle-1 mb-3">¿Estás seguro de que deseas eliminar esta pregunta?</p>
          <v-alert type="warning" variant="tonal" class="mb-3">
            Esta acción no se puede deshacer.
          </v-alert>
          <div v-if="questionToDelete" class="question-preview">
            <p class="font-weight-bold">ID: {{ questionToDelete.id }}</p>
            <p class="text-truncate">{{ questionToDelete.text }}</p>
          </div>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn @click="showDeleteQuestionDialog = false" variant="outlined">
            Cancelar
          </v-btn>
          <v-btn 
            color="error" 
            @click="confirmDeleteQuestion" 
            :loading="deletingQuestion"
            prepend-icon="mdi-delete"
            variant="elevated"
            class="ml-2"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog para confirmar reset del ranking -->
    <v-dialog v-model="showResetRankingDialog" max-width="450">
      <v-card class="qqss-ring" elevation="16">
        <v-card-title class="bg-error text-white d-flex align-center pa-4">
          <v-icon start color="white">mdi-refresh-circle</v-icon>
          Reiniciar Ranking
        </v-card-title>
        <v-card-text class="pa-6">
          <div class="text-center mb-4">
            <v-icon size="80" color="error">mdi-trophy-broken</v-icon>
          </div>
          <p class="text-h6 text-center mb-3">¿Estás completamente seguro?</p>
          <p class="text-subtitle-1 mb-4">Esta acción eliminará permanentemente:</p>
          <v-list class="bg-transparent">
            <v-list-item prepend-icon="mdi-trophy" title="Todos los puntajes de jugadores" />
            <v-list-item prepend-icon="mdi-chart-line" title="El ranking completo" />
            <v-list-item prepend-icon="mdi-history" title="Todo el historial de partidas" />
          </v-list>
          <v-alert type="error" variant="tonal" class="mt-4">
            <v-icon start>mdi-alert-circle</v-icon>
            Esta acción NO se puede deshacer
          </v-alert>
        </v-card-text>
        <v-card-actions class="bg-grey-lighten-5 pa-4">
          <v-spacer />
          <v-btn 
            @click="showResetRankingDialog = false" 
            variant="outlined"
            color="success"
            prepend-icon="mdi-cancel"
          >
            Cancelar
          </v-btn>
          <v-btn 
            color="error" 
            @click="confirmResetRanking" 
            :loading="loadingReset"
            prepend-icon="mdi-delete-sweep"
            variant="elevated"
            class="ml-2"
          >
            Sí, Reiniciar Todo
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog para crear nueva oración -->
    <v-dialog v-model="showNewPrayerDialog" max-width="500" persistent>
      <v-card class="qqss-ring" elevation="16">
        <v-card-title class="bg-warning text-white d-flex align-center pa-4">
          <v-icon start size="28" color="white">mdi-plus-circle</v-icon>
          <span class="text-h5 font-weight-bold">Nueva Oración</span>
          <v-spacer />
          <v-btn
            icon="mdi-close"
            size="small"
            variant="text"
            color="white"
            @click="showNewPrayerDialog = false"
          />
        </v-card-title>
        
        <v-card-text class="pa-6">
          <v-form @submit.prevent="createPrayer" ref="prayerForm">
            <v-text-field
              v-model="newPrayer.title"
              label="Título de la Oración"
              variant="outlined"
              class="mb-4"
              :rules="[v => !!v || 'El título es obligatorio']"
              required
              prepend-inner-icon="mdi-format-title"
            />

            <v-textarea
              v-model="newPrayer.text"
              label="Texto de la Oración"
              variant="outlined"
              rows="6"
              :rules="[v => !!v || 'El texto de la oración es obligatorio']"
              required
              prepend-inner-icon="mdi-script-text"
              auto-grow
              placeholder="Escribe aquí el contenido completo de la oración..."
            />
          </v-form>
        </v-card-text>
        
        <v-card-actions class="bg-grey-lighten-5 pa-4">
          <v-spacer />
          <v-btn 
            @click="resetPrayerForm(); showNewPrayerDialog = false" 
            variant="outlined"
            color="grey"
            prepend-icon="mdi-cancel"
          >
            Cancelar
          </v-btn>
          <v-btn 
            color="warning" 
            @click="createPrayer" 
            :loading="creatingPrayer"
            prepend-icon="mdi-content-save"
            variant="elevated"
            class="ml-2"
          >
            Guardar Oración
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog para editar oración -->
    <v-dialog v-model="showEditPrayerDialog" max-width="500" persistent>
      <v-card class="qqss-ring" elevation="16">
        <v-card-title class="bg-primary text-white d-flex align-center pa-4">
          <v-icon start size="28" color="white">mdi-pencil</v-icon>
          <span class="text-h5 font-weight-bold">Editar Oración</span>
          <v-spacer />
          <v-btn
            icon="mdi-close"
            size="small"
            variant="text"
            color="white"
            @click="showEditPrayerDialog = false"
          />
        </v-card-title>
        
        <v-card-text class="pa-6">
          <v-form @submit.prevent="updatePrayer" ref="editPrayerForm">
            <v-text-field
              v-model="editingPrayer.title"
              label="Título de la Oración"
              variant="outlined"
              class="mb-4"
              :rules="[v => !!v || 'El título es obligatorio']"
              required
              prepend-inner-icon="mdi-format-title"
            />

            <v-textarea
              v-model="editingPrayer.text"
              label="Texto de la Oración"
              variant="outlined"
              rows="6"
              :rules="[v => !!v || 'El texto de la oración es obligatorio']"
              required
              prepend-inner-icon="mdi-script-text"
              auto-grow
              placeholder="Escribe aquí el contenido completo de la oración..."
            />
          </v-form>
        </v-card-text>
        
        <v-card-actions class="bg-grey-lighten-5 pa-4">
          <v-spacer />
          <v-btn 
            @click="showEditPrayerDialog = false" 
            variant="outlined"
            color="grey"
            prepend-icon="mdi-cancel"
          >
            Cancelar
          </v-btn>
          <v-btn 
            color="primary" 
            @click="updatePrayer" 
            :loading="updatingPrayer"
            prepend-icon="mdi-content-save"
            variant="elevated"
            class="ml-2"
          >
            Actualizar Oración
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog para confirmar eliminación de oración -->
    <v-dialog v-model="showDeletePrayerDialog" max-width="400">
      <v-card class="qqss-ring" elevation="12">
        <v-card-title class="bg-error text-white d-flex align-center pa-4">
          <v-icon start color="white">mdi-delete-alert</v-icon>
          Eliminar Oración
        </v-card-title>
        <v-card-text class="pa-4">
          <p class="text-subtitle-1 mb-3">¿Estás seguro de que deseas eliminar esta oración?</p>
          <v-alert type="warning" variant="tonal" class="mb-3">
            Esta acción no se puede deshacer.
          </v-alert>
          <div v-if="prayerToDelete" class="prayer-preview">
            <p class="font-weight-bold">ID: {{ prayerToDelete.id }}</p>
            <p class="font-weight-bold">{{ prayerToDelete.title }}</p>
            <p class="text-truncate">{{ prayerToDelete.text }}</p>
          </div>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn @click="showDeletePrayerDialog = false" variant="outlined">
            Cancelar
          </v-btn>
          <v-btn 
            color="error" 
            @click="confirmDeletePrayer" 
            :loading="deletingPrayer"
            prepend-icon="mdi-delete"
            variant="elevated"
            class="ml-2"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

// Estados de autenticación
const isAuthenticated = ref(false);
const user = ref(null);
const loading = ref(false);
const loginError = ref('');
const showPassword = ref(false);

// Credenciales de login
const credentials = ref({
  username: '',
  password: ''
});

// Validaciones
const usernameRules = [
  value => !!value || 'El usuario es obligatorio',
  value => value?.length >= 3 || 'El usuario debe tener al menos 3 caracteres'
];

const passwordRules = [
  value => !!value || 'La contraseña es obligatoria',
  value => value?.length >= 6 || 'La contraseña debe tener al menos 6 caracteres'
];

// Estados del panel
const activeTab = ref('ranking');
const ranking = ref([]);
const questions = ref([]);
const prayers = ref([]);
const gameStatus = ref({ locked: false });
const availableCategories = ref([]);

// Estados de carga
const loadingRanking = ref(false);
const loadingQuestions = ref(false);
const loadingPrayers = ref(false);
const loadingReset = ref(false);

// Dialogs
const showLockDialog = ref(false);
const showUnlockDialog = ref(false);
const showNewQuestionDialog = ref(false);
const showEditQuestionDialog = ref(false);
const showDeleteQuestionDialog = ref(false);
const showResetRankingDialog = ref(false);
const showNewPrayerDialog = ref(false);
const showEditPrayerDialog = ref(false);
const showDeletePrayerDialog = ref(false);
const gamePin = ref('');

// Nueva pregunta
const creatingQuestion = ref(false);
const updatingQuestion = ref(false);
const deletingQuestion = ref(false);
const questionToDelete = ref(null);
const questionForm = ref(null);

// Oraciones
const creatingPrayer = ref(false);
const updatingPrayer = ref(false);
const deletingPrayer = ref(false);
const prayerToDelete = ref(null);
const prayerForm = ref(null);
const editPrayerForm = ref(null);
const newQuestion = ref({
  text: '',
  options: ['', '', '', ''],
  correctIndex: null,
  difficulty: null,
  category: '',
  verseHint: '',
  explanation: '',
  source: ''
});

// Pregunta en edición
const editingQuestion = ref({
  id: null,
  text: '',
  options: ['', '', '', ''],
  correctIndex: null,
  difficulty: null,
  category: '',
  verseHint: '',
  explanation: '',
  source: ''
});

// Nueva oración
const newPrayer = ref({
  title: '',
  text: ''
});

// Oración en edición
const editingPrayer = ref({
  id: null,
  title: '',
  text: ''
});

// Headers para las tablas
const rankingHeaders = [
  { title: 'Posición', key: 'index', width: '100px' },
  { title: 'Jugador', key: 'playerName' },
  { title: 'Puntos', key: 'points', width: '150px' },
  { title: 'Fecha', key: 'createdAt', width: '180px' }
];

const questionHeaders = [
  { title: 'ID', key: 'id', width: '80px' },
  { title: 'Pregunta', key: 'text' },
  { title: 'Dificultad', key: 'difficulty', width: '120px' },
  { title: 'Categoría', key: 'category', width: '150px' },
  { title: 'Acciones', key: 'actions', width: '120px', sortable: false }
];

const prayerHeaders = [
  { title: 'ID', key: 'id', width: '80px' },
  { title: 'Título', key: 'title' },
  { title: 'Texto', key: 'text' },
  { title: 'Acciones', key: 'actions', width: '120px', sortable: false }
];

// Verificar si ya está autenticado
onMounted(() => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    isAuthenticated.value = true;
    loadAdminData();
  }
});

// Funciones de autenticación
async function login() {
  if (!credentials.value.username || !credentials.value.password) return;
  
  loading.value = true;
  loginError.value = '';
  
  try {
    const response = await axios.post('/api/auth/login', credentials.value);
    const { token, user: userData } = response.data;
    
    // Guardar token
    localStorage.setItem('adminToken', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Actualizar estado
    isAuthenticated.value = true;
    user.value = userData;
    
    // Cargar datos del panel
    await loadAdminData();
    
  } catch (error) {
    loginError.value = error.response?.data?.error || 'Error de autenticación';
  } finally {
    loading.value = false;
  }
}

function logout() {
  localStorage.removeItem('adminToken');
  delete axios.defaults.headers.common['Authorization'];
  isAuthenticated.value = false;
  user.value = null;
  router.push('/');
}

// Funciones de carga de datos
async function loadAdminData() {
  await Promise.all([
    loadRanking(),
    loadQuestions(),
    loadPrayers()
  ]);
}

async function loadRanking() {
  loadingRanking.value = true;
  try {
    const response = await axios.get('/api/ranking');
    ranking.value = response.data.map((item, index) => ({ ...item, index }));
  } catch (error) {
    console.error('Error loading ranking:', error);
  } finally {
    loadingRanking.value = false;
  }
}

async function loadQuestions() {
  loadingQuestions.value = true;
  try {
    const response = await axios.get('/api/admin/questions');
    questions.value = response.data;
    
    // Extraer categorías únicas (sin duplicados y sin valores vacíos)
    const categories = questions.value
      .map(q => q.category)
      .filter(cat => cat && cat.trim()) // Eliminar valores vacíos o null
      .filter((cat, index, arr) => arr.indexOf(cat) === index) // Eliminar duplicados
      .sort(); // Ordenar alfabéticamente
    
    availableCategories.value = categories;
  } catch (error) {
    console.error('Error loading questions:', error);
  } finally {
    loadingQuestions.value = false;
  }
}

async function loadPrayers() {
  loadingPrayers.value = true;
  try {
    const response = await axios.get('/api/admin/prayers');
    prayers.value = response.data;
  } catch (error) {
    console.error('Error loading prayers:', error);
  } finally {
    loadingPrayers.value = false;
  }
}

// Funciones de gestión
async function confirmResetRanking() {
  loadingReset.value = true;
  try {
    await axios.post('/api/admin/ranking/reset');
    await loadRanking();
    showResetRankingDialog.value = false;
    console.log('Ranking reiniciado exitosamente');
  } catch (error) {
    console.error('Error resetting ranking:', error);
  } finally {
    loadingReset.value = false;
  }
}

async function lockGame() {
  try {
    await axios.post('/api/admin/lock', { pin: gamePin.value });
    gameStatus.value.locked = true;
    showLockDialog.value = false;
    gamePin.value = '';
  } catch (error) {
    console.error('Error locking game:', error);
  }
}

async function unlockGame() {
  try {
    await axios.post('/api/admin/unlock', { pin: gamePin.value });
    gameStatus.value.locked = false;
    showUnlockDialog.value = false;
    gamePin.value = '';
  } catch (error) {
    console.error('Error unlocking game:', error);
  }
}

async function exportQuestions() {
  try {
    const response = await axios.get('/api/admin/questions/export');
    const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questions.json';
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting questions:', error);
  }
}

async function exportQuestionsCSV() {
  try {
    const response = await axios.get('/api/admin/questions/export?format=csv');
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questions.csv';
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting CSV:', error);
  }
}

async function createQuestion() {
  // Validar el formulario
  const { valid } = await questionForm.value.validate();
  if (!valid) return;

  creatingQuestion.value = true;
  try {
    const response = await axios.post('/api/admin/questions', {
      text: newQuestion.value.text,
      options: newQuestion.value.options.filter(option => option.trim()),
      correctIndex: newQuestion.value.correctIndex,
      difficulty: newQuestion.value.difficulty,
      category: newQuestion.value.category || 'General',
      verseHint: newQuestion.value.verseHint || null,
      explanation: newQuestion.value.explanation || null,
      source: newQuestion.value.source || null
    });

    // Agregar la nueva pregunta a la lista
    questions.value.push(response.data);
    
    // Actualizar lista de categorías si se agregó una nueva
    const newCategory = newQuestion.value.category;
    if (newCategory && newCategory.trim() && !availableCategories.value.includes(newCategory)) {
      availableCategories.value.push(newCategory);
      availableCategories.value.sort(); // Mantener orden alfabético
    }
    
    // Limpiar el formulario
    newQuestion.value = {
      text: '',
      options: ['', '', '', ''],
      correctIndex: null,
      difficulty: null,
      category: '',
      verseHint: '',
      explanation: '',
      source: ''
    };
    
    // Cerrar el diálogo
    showNewQuestionDialog.value = false;
    
    // Mostrar mensaje de éxito (puedes agregar un snackbar aquí si quieres)
    console.log('Pregunta creada exitosamente');
    
  } catch (error) {
    console.error('Error creating question:', error);
    // Aquí podrías mostrar un mensaje de error al usuario
  } finally {
    creatingQuestion.value = false;
  }
}

function resetQuestionForm() {
  newQuestion.value = {
    text: '',
    options: ['', '', '', ''],
    correctIndex: null,
    difficulty: null,
    category: '',
    verseHint: '',
    explanation: '',
    source: ''
  };
  questionForm.value?.resetValidation();
}

// Funciones para editar preguntas
function editQuestion(question) {
  editingQuestion.value = {
    id: question.id,
    text: question.text,
    options: [...question.options] || ['', '', '', ''],
    correctIndex: question.correctIndex,
    difficulty: question.difficulty,
    category: question.category || '',
    verseHint: question.verseHint || '',
    explanation: question.explanation || '',
    source: question.source || ''
  };
  showEditQuestionDialog.value = true;
}

async function updateQuestion() {
  // Validar el formulario
  const form = document.querySelector('[ref="editQuestionForm"]');
  if (form) {
    const { valid } = await form.validate();
    if (!valid) return;
  }

  updatingQuestion.value = true;
  try {
    const response = await axios.put(`/api/admin/questions/${editingQuestion.value.id}`, {
      text: editingQuestion.value.text,
      options: editingQuestion.value.options.filter(option => option.trim()),
      correctIndex: editingQuestion.value.correctIndex,
      difficulty: editingQuestion.value.difficulty,
      category: editingQuestion.value.category || 'General',
      verseHint: editingQuestion.value.verseHint || null,
      explanation: editingQuestion.value.explanation || null,
      source: editingQuestion.value.source || null
    });

    // Actualizar la pregunta en la lista
    const index = questions.value.findIndex(q => q.id === editingQuestion.value.id);
    if (index !== -1) {
      questions.value[index] = response.data;
    }
    
    // Actualizar lista de categorías si se agregó una nueva
    const newCategory = editingQuestion.value.category;
    if (newCategory && newCategory.trim() && !availableCategories.value.includes(newCategory)) {
      availableCategories.value.push(newCategory);
      availableCategories.value.sort(); // Mantener orden alfabético
    }
    
    // Cerrar el diálogo
    showEditQuestionDialog.value = false;
    
    console.log('Pregunta actualizada exitosamente');
    
  } catch (error) {
    console.error('Error updating question:', error);
  } finally {
    updatingQuestion.value = false;
  }
}

// Funciones para eliminar preguntas
function deleteQuestion(question) {
  questionToDelete.value = question;
  showDeleteQuestionDialog.value = true;
}

async function confirmDeleteQuestion() {
  if (!questionToDelete.value) return;

  deletingQuestion.value = true;
  try {
    await axios.delete(`/api/admin/questions/${questionToDelete.value.id}`);
    
    // Remover la pregunta de la lista
    const index = questions.value.findIndex(q => q.id === questionToDelete.value.id);
    if (index !== -1) {
      questions.value.splice(index, 1);
    }
    
    // Actualizar categorías disponibles (remover categorías que ya no se usan)
    const usedCategories = questions.value
      .map(q => q.category)
      .filter(cat => cat && cat.trim())
      .filter((cat, index, arr) => arr.indexOf(cat) === index)
      .sort();
    
    availableCategories.value = usedCategories;
    
    // Cerrar el diálogo
    showDeleteQuestionDialog.value = false;
    questionToDelete.value = null;
    
    console.log('Pregunta eliminada exitosamente');
    
  } catch (error) {
    console.error('Error deleting question:', error);
  } finally {
    deletingQuestion.value = false;
  }
}

// Funciones CRUD para Oraciones
async function createPrayer() {
  // Validar el formulario
  const { valid } = await prayerForm.value.validate();
  if (!valid) return;

  creatingPrayer.value = true;
  try {
    const response = await axios.post('/api/admin/prayers', {
      title: newPrayer.value.title.trim(),
      text: newPrayer.value.text.trim()
    });

    // Agregar la nueva oración a la lista
    prayers.value.push(response.data);
    
    // Limpiar el formulario
    resetPrayerForm();
    
    // Cerrar el diálogo
    showNewPrayerDialog.value = false;
    
    console.log('Oración creada exitosamente');
    
  } catch (error) {
    console.error('Error creating prayer:', error);
  } finally {
    creatingPrayer.value = false;
  }
}

function resetPrayerForm() {
  newPrayer.value = {
    title: '',
    text: ''
  };
  prayerForm.value?.resetValidation();
}

// Funciones para editar oraciones
function editPrayer(prayer) {
  editingPrayer.value = {
    id: prayer.id,
    title: prayer.title || '',
    text: prayer.text || ''
  };
  showEditPrayerDialog.value = true;
}

async function updatePrayer() {
  // Validar el formulario
  const { valid } = await editPrayerForm.value.validate();
  if (!valid) return;

  updatingPrayer.value = true;
  try {
    const response = await axios.put(`/api/admin/prayers/${editingPrayer.value.id}`, {
      title: editingPrayer.value.title.trim(),
      text: editingPrayer.value.text.trim()
    });

    // Actualizar la oración en la lista
    const index = prayers.value.findIndex(p => p.id === editingPrayer.value.id);
    if (index !== -1) {
      prayers.value[index] = response.data;
    }
    
    // Cerrar el diálogo
    showEditPrayerDialog.value = false;
    
    console.log('Oración actualizada exitosamente');
    
  } catch (error) {
    console.error('Error updating prayer:', error);
  } finally {
    updatingPrayer.value = false;
  }
}

// Funciones para eliminar oraciones
function deletePrayer(prayer) {
  prayerToDelete.value = prayer;
  showDeletePrayerDialog.value = true;
}

async function confirmDeletePrayer() {
  if (!prayerToDelete.value) return;

  deletingPrayer.value = true;
  try {
    await axios.delete(`/api/admin/prayers/${prayerToDelete.value.id}`);
    
    // Remover la oración de la lista
    const index = prayers.value.findIndex(p => p.id === prayerToDelete.value.id);
    if (index !== -1) {
      prayers.value.splice(index, 1);
    }
    
    // Cerrar el diálogo
    showDeletePrayerDialog.value = false;
    prayerToDelete.value = null;
    
    console.log('Oración eliminada exitosamente');
    
  } catch (error) {
    console.error('Error deleting prayer:', error);
  } finally {
    deletingPrayer.value = false;
  }
}

// Funciones auxiliares
function getPlayerColor(index) {
  if (index === 0) return 'warning';
  if (index === 1) return 'blue-grey';
  if (index === 2) return 'deep-orange';
  return 'primary';
}

function getDifficultyColor(difficulty) {
  if (difficulty <= 5) return 'success';
  if (difficulty <= 10) return 'warning';
  return 'error';
}
</script>

<style scoped>
.admin-container {
  min-height: 100vh;
  background: linear-gradient(135deg, 
    rgba(11,27,63,0.95) 0%, 
    rgba(30,60,120,0.95) 50%, 
    rgba(11,27,63,0.95) 100%
  );
  padding: 2rem 1rem;
}

.login-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
}

.login-card {
  background: linear-gradient(135deg, 
    rgba(11,27,63,0.95) 0%, 
    rgba(30,60,120,0.95) 50%, 
    rgba(11,27,63,0.95) 100%
  );
  backdrop-filter: blur(10px);
  border: 2px solid var(--qqss-accent, #F0C419);
}

.login-header {
  text-align: center;
  padding: 2rem 1rem 1rem;
  background: linear-gradient(90deg, 
    rgba(240,196,25,0.1) 0%, 
    rgba(240,196,25,0.2) 50%, 
    rgba(240,196,25,0.1) 100%
  );
  border-bottom: 1px solid rgba(240,196,25,0.3);
}

.login-icon {
  animation: iconPulse 2s ease-in-out infinite;
  filter: drop-shadow(0 0 10px currentColor);
}

.login-title {
  color: var(--qqss-accent, #F0C419);
  font-family: 'Arial Black', sans-serif;
  font-size: 1.8rem;
  margin: 1rem 0 0.5rem 0;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}

.login-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
}

.login-form {
  padding: 2rem;
}

.login-btn {
  background: linear-gradient(45deg, rgba(240,196,25,0.9) 0%, rgba(240,196,25,1) 100%) !important;
  color: rgba(11,27,63,1) !important;
  font-weight: bold;
  text-transform: uppercase;
}

.admin-panel {
  max-width: 1200px;
  margin: 0 auto;
}

.admin-header {
  background: linear-gradient(135deg, 
    rgba(11,27,63,0.95) 0%, 
    rgba(30,60,120,0.95) 50%, 
    rgba(11,27,63,0.95) 100%
  );
  border: 2px solid var(--qqss-accent, #F0C419);
}

.admin-title {
  color: var(--qqss-accent, #F0C419);
  font-family: 'Arial Black', sans-serif;
  font-size: 1.5rem;
  margin: 0;
}

.admin-welcome {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin: 0;
}

.control-card {
  background: rgba(240, 196, 25, 0.1);
  border: 1px solid rgba(240, 196, 25, 0.3);
}

.game-controls {
  display: grid;
  gap: 1rem;
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* Responsivo */
@media (max-width: 600px) {
  .login-title {
    font-size: 1.5rem;
  }
  
  .admin-container {
    padding: 1rem 0.5rem;
  }
}
</style>
