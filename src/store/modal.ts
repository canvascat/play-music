import { reactive, ref } from "vue";
import { defineStore } from "pinia";

export const useModalStore = defineStore("modal", () => {
	const show = reactive({
		newPlaylist: false,
		addTrackToPlaylist: false,
	});

	const afterCreateAddTrackID = ref(0);
	const selectedTrackID = ref(0);

	const showNewPlaylist = (trackID: number = 0) => {
		show.newPlaylist = true;
		afterCreateAddTrackID.value = trackID;
	};
	const showAddTrackToPlaylist = (trackID: number) => {
		show.addTrackToPlaylist = true;
		selectedTrackID.value = trackID;
	};
	const closeNewPlaylist = () => {
		show.newPlaylist = false;
		afterCreateAddTrackID.value = 0;
	};
	const closeAddTrackToPlaylist = () => {
		show.addTrackToPlaylist = false;
		selectedTrackID.value = 0;
	};

	return {
		show,
		showNewPlaylist,
		showAddTrackToPlaylist,
		closeNewPlaylist,
		closeAddTrackToPlaylist,
		afterCreateAddTrackID,
		selectedTrackID,
	};
});
