<template>
  <div style="max-width: 700px; margin: auto; padding: 1rem;">
    <h1>Photo Gallery</h1>

    <div style="margin-bottom: 1rem;">
      <input
        v-model="filters.title"
        @input="onFilterChange"
        placeholder="Filter by photo title"
        style="margin-right: 0.5rem;"
      />
      <input
        v-model="filters.albumTitle"
        @input="onFilterChange"
        placeholder="Filter by album title"
        style="margin-right: 0.5rem;"
      />
      <input
        v-model="filters.userEmail"
        @input="onFilterChange"
        placeholder="Filter by user email"
      />
    </div>

    <div style="margin-bottom: 1rem;">
      <label>
        Items per page:
        <select v-model.number="limit" @change="onLimitChange">
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
        </select>
      </label>
    </div>

    <div v-if="loading">Loading photos...</div>
    <div v-else>
      <div v-if="photos.length === 0">No photos found.</div>
      <div v-else>
        <div
          v-for="photo in photos"
          :key="photo.id"
          style="border: 1px solid #ccc; margin-bottom: 0.8rem; padding: 0.5rem; border-radius: 5px;"
        >
          <h3>{{ photo.title }}</h3>
          <p>
            Album: {{ photo.album.title }} <br />
            User: {{ photo.album.user.name }} ({{ photo.album.user.email }})
          </p>
          <img :src="photo.thumbnailUrl" alt="thumbnail" style="max-width: 150px;" />
        </div>

        <div style="margin-top: 1rem;">
          <button :disabled="offset === 0" @click="prevPage">Prev</button>
          <button
            :disabled="offset + limit >= total"
            @click="nextPage"
            style="margin-left: 1rem;"
          >
            Next
          </button>
        </div>
        <p>
          Page {{ currentPage }} of {{ totalPages }} |
          Total items: {{ total }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";

const photos = ref([]);
const total = ref(0);
const limit = ref(25);
const offset = ref(0);
const loading = ref(false);

const filters = reactive({
  title: "",
  albumTitle: "",
  userEmail: "",
});

// API URL - para desarrollo local usa localhost:8888, para producción usa rutas relativas
const API_URL = import.meta.env.DEV 
  ? "http://localhost:8888/externalapi/photos" 
  : "/api/photos";

async function fetchPhotos() {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    if (filters.title) params.append("title", filters.title);
    if (filters.albumTitle) params.append("album.title", filters.albumTitle);
    if (filters.userEmail) params.append("album.user.email", filters.userEmail);
    params.append("limit", limit.value);
    params.append("offset", offset.value);

    const response = await fetch(`${API_URL}?${params.toString()}`);
    const data = await response.json();

    photos.value = data.data;
    total.value = data.total;
  } catch (error) {
    console.error("Error fetching photos:", error);
    photos.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

const currentPage = computed(() => Math.floor(offset.value / limit.value) + 1);
const totalPages = computed(() =>
  Math.ceil(total.value / limit.value)
);

function prevPage() {
  if (offset.value >= limit.value) {
    offset.value -= limit.value;
    fetchPhotos();
  }
}

function nextPage() {
  if (offset.value + limit.value < total.value) {
    offset.value += limit.value;
    fetchPhotos();
  }
}

function onFilterChange() {
  offset.value = 0; // Reset to first page when filter changes
  fetchPhotos();
}

function onLimitChange() {
  offset.value = 0; // Reset to first page when limit changes
  fetchPhotos();
}

// Inicializa datos
fetchPhotos();
</script>
