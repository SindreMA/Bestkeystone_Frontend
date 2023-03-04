<template>
      <div class="projectCard  shadow-18 col-grow ">
        <div>
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
  background-color: rgb(44, 44, 44);
  width: 500px;
  margin: 15px 15px;
  min-height: 105px;
  padding: 10px;
}
.projectCard:hover {
  zoom: 1.05;
}
.imageSize {
  width: 65px;
  height: 65px;
}
.InstallButton {
  height: 30px;
  width: 200px;
  background-color: rgb(100, 65, 165);
}
</style>
