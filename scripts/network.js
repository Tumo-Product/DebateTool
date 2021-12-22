axios.defaults.baseURL = "https://content-tools.tumo.world:4000";

const network = {
    getData: async() => {
        let href = document.location.href;
        let splitPath = href.split("/");
        let string = splitPath[splitPath.length - 2];
        let getString = `../data/${string}.json`;
        let data;

        await $.get(getString, function (json) {
            data = json;
        });

        return data;
    },
    getFile : async (path) => {
		let data = await axios.post("video/getfile", {path: path});
		let baseData = data.data.data;
		return baseData;
	}
}