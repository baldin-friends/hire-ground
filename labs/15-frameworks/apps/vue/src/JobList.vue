<script setup lang="ts">
import { jobs } from './jobs';
</script>

<template>
    <h1>Open positions</h1>
    <ul class="jobs" role="list">
        <li v-for="job in jobs" :key="job.slug">
            <h2>{{ job.title }}</h2>
            <p>{{ job.location }}</p>
            <RouterLink :to="`/apply/${job.slug}`">Apply</RouterLink>
        </li>
    </ul>
</template>
