// import sessionData from '../tmpOut/Session.json' assert {type: "json"};

export function resolveObjects(sessionData: any): any {
    const objects = sessionData.$objects as any[];
    // const firstObject = objects[1];
    let transformedObjects: any[] = [];
    function transformObject(obj: any): any {
        // console.log("Transforming an object...")
        if(typeof obj !== "object") return obj; // termination condition
        if(obj?.id) return transformObject(objects[obj.id]);
        Object.keys(obj).forEach((key) => {
            obj[key] = transformObject(obj[key]);
        });
        return obj;
    }

    objects.forEach((val, ind) => {
        transformedObjects[ind] = transformObject(val);
    });
    const newData = sessionData as any;
    newData.$objects = transformedObjects;
    return newData.objects[1];
}