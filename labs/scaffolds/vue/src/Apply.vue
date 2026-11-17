<script setup lang="ts">
import { computed, ref } from 'vue';
import { jobs, workingModels } from './jobs';
import SelectBox from './SelectBox.vue';

const props = defineProps<{ slug: string }>();

const job = computed(() => jobs.find((j) => j.slug === props.slug));
const email = ref('');
const model = ref('');
const sent = ref(false);
</script>

<template>
    <h1 v-if="!job">Position not found</h1>
    <template v-else-if="sent">
        <h1>Thank you for applying</h1>
        <p>We will write to {{ email }} about the {{ job.title }} position. Working model: {{ model || 'not chosen' }}.</p>
        <RouterLink to="/">Back to all positions</RouterLink>
    </template>
    <template v-else>
        <h1>Apply: {{ job.title }}</h1>
        <form @submit.prevent="sent = true">
            <label for="email">Email</label>
            <input id="email" v-model="email" type="email" required />
            <SelectBox id="model" v-model="model" label="Working model" placeholder="Please choose" :options="workingModels" />
            <button type="submit">Submit application</button>
        </form>
    </template>
</template>
