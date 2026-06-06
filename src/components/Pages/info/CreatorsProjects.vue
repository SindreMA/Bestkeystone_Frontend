<template>
      <div class="projectCard  shadow-18 col-grow ">
        <div style="flex: 1;">
          <div class="HeaderSize4">{{project.title}}</div>
          <div>{{project.description}}</div>
        </div>
        <div>
          <a :href="project.image_link">
              <q-img spinner-size="10px" :src="project.image_url" class="imageSize">
                <q-tooltip v-if="project.image_tooltip">{{project.image_tooltip}}</q-tooltip>
              </q-img>
          </a>
        </div>
      </div>
</template>

<script>
export default {
  props: ['project']  
}
</script>

<style scoped>
.projectCard {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-surface);
  border: 1px solid var(--line-default);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 500px;
  min-height: 105px;
  padding: 16px;
  transition: all var(--transition-normal);
}
.projectCard:hover {
  transform: translateY(-4px) scale(1.02);
  border-color: var(--line-strong);
}
.imageSize {
  flex: none;
  width: 65px;
  height: 65px;
  border-radius: var(--radius-md);
}
.InstallButton {
  height: 30px;
  width: 200px;
  background: var(--brand-gradient);
  border-radius: var(--radius-full);
}
</style>
