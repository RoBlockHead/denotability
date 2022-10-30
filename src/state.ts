interface StateData {
    tempDirectory: string,
    persistTempDirectory: boolean,
    workingNotes?: Note[],
}
interface Note {
    static: boolean,
    
}
class State {
    private state: StateData;
    constructor() {
        this.state = {
            tempDirectory: "",
            persistTempDirectory: false,
        };
    }

    public async get(): Promise<StateData> {
        return <StateData>(JSON.parse(await Deno.readTextFile("../data/state.json")));
    }

    public async setTempDir(path: string): Promise<void> {
        this.state.tempDirectory = path;
        await this.writeData();
    }

    public async getTempDir(): Promise<string> {
        await this.fetchData();
        return this.state.tempDirectory;
    }

    private async fetchData() {
        let textData = await Deno.readTextFile("../data/state.json");
        this.state = JSON.parse(textData);
    }
    private async writeData() {
        await Deno.writeTextFile("../data/state.json", JSON.stringify(this.state));
    }
}
type StateType = {
    tmpDir?: string,

}

// export const getState = async (): Promise<State> => {
//     return <State>(await import("../data/state.json"));
// }

// export const setTempDir = async (path: string): Promise<void> => {
//     const state: State = <State>(await import("../data/state.json"));
//     state.tmpDir = path;

//     await Deno.writeTextFile("../data/state.json", JSON.stringify(state, null, "\t"));
// }