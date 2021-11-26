const network = {
    getData: async() => {
        let url = new URL(document.location.href);
        let lan = url.searchParams.get("lan");
        let id  = url.searchParams.get("id");
        let getString = `data/${lan}/${id}.json`;
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