<script setup>
import WelcomeItem from '@/components/WelcomeItem.vue';
import TheWelcome from '../components/TheWelcome.vue'
</script>

<template>
  <main>
    <Suspense><TheWelcome /></Suspense>    
  </main>
</template>
