import React, { useState, useEffect } from 'react';

export function generateRoutes(source) {
    const paths = source.paths;

    let routes = {};
    //console.log(`api routes is ` + ApiRoutes)

    for (const path in paths) {
        for (const verb in paths[path]) {
            const { tags, summary, parameters, produces, operationId} = paths[path][verb]
           // console.log(`${path} ${verb} ${tags} ${summary} ${parameters} ${produces}`)
            if (!routes[tags])
                routes[tags] = {}
            if (!routes[tags][path])
                routes[tags][path] = {}

            const scheme = source.schemes ? source.schemes[0] + "://": ""
            const host = source.host || "";
            const base = source.basePath || "";

            // pull out the api route function 
            const operation = {
                path: scheme + host + base + path,
                verb: verb,
                id: operationId,
                parameters: {
                    path: [],
                    body: [],
                    query: [],
                    formData: []
                }
            }

            if (paths[path][verb].consumes ) {
                operation.consumes = paths[path][verb].consumes
            }

            if(paths[path][verb].summary && paths[path][verb].summary != "" ){
                operation.summary = paths[path][verb].summary
            }
            if(paths[path][verb].description && paths[path][verb].description != ""){
                operation.description = paths[path][verb].description;
            }

            console.log("Here at generating")

            if (parameters) {
                parameters.forEach((entry) => {
                    if (entry.in == "path") {

                        operation.parameters.path.push({ name: entry.name, description: entry.description, type: entry.type, enum: entry.enum , format: entry.format, required: entry.required})
                    } else if (entry.in == "query") {
                        operation.parameters.query.push({ name: entry.name, description: entry.description, type: entry.type, enum: entry.enum, format: entry.format, required: entry.required })
                    } else if (entry.in == "body") {
                        let processedBody = processBodyParams(entry.schema);
                        operation.parameters.body = operation.parameters.body.concat(processedBody)
                    } else if (entry.in == "formData") {
                        operation.parameters.formData.push({ name: entry.name, description: entry.description, type: entry.type, format: entry.format, required: entry.required })
                    }
                })
            }

            operation.useHook = () => {
                return useRemoteApi(operation)
            }

           // console.log(`operation is ${JSON.stringify(operation, "", 2)}`)
            routes[tags][path][verb] = {
                summary,
                parameters,
                produces,
                operation
            }
        }
    }

    return routes
}

export function generateRouteMeta(source){
	const {info, host, basePath } = source;
	const tags = {};
	
	source.tags.forEach((entry)=>{
		tags[entry.name] = {
			description : entry.description, 
			externalDocs: entry.externalDocs
		}
	})
	
	return {info, host, basePath, tags}
}


function useRemoteApi(operation, base) {

    const [state, setState] = useState({
        result: {message: "ready ..."},
        loading: false
    });
    const [fetchParams, setFetchParams] = useState(null)

    function encodeParams(params) {
        const encodedParams = {};
        for (const name in params) {
            encodedParams[name] = encodeURIComponent(params[name]);
        }

        return encodedParams;
    }


    function fetchData(params) {

        if (state.loading) {
          //  console.log("trying to fetch ontop of an fetch that is already running")
            return;
        }

        let clone = { ...state };

        let path = operation.path;
        let error = [];



        // create the path with path params
        operation.parameters.path.forEach((entry) => {
            let exp = new RegExp(`{${entry.name}}`, 'i')
            if (!path.match(exp)) {
                error.push(`missing parameter ${entry.name}`);
                return;
            }
            path = path.replace(exp, encodeURIComponent(params.path[entry.name]));
        })

        if (error.length > 0) {
            clone.result = {message: "The following errors occured: " + JSON.stringify(error)};
            setState(clone);
            return;
        }

        // add the query params
        let queryParams = []
        operation.parameters.query.forEach((entry) => {
            queryParams.push(`${entry.name}=${encodeURIComponent(params.query[entry.name])}`)
        })

        if (queryParams.length > 0) {
            path = path + "?" + queryParams.join("&")
        }

        // process body params
        let bodyParams = {}
        operation.parameters.body.forEach((entry) => {
            bodyParams[entry.name] = params.body[entry.name]
        })

        // process formData
        let formData = new FormData();
        operation.parameters.formData.forEach((entry) => {

            formData.append(entry.name, params.formData[entry.name])

        })

        //console.log(`constructed full path ${path} with body ${JSON.stringify(bodyParams, "", 2)} and formData ${JSON.stringify(formData, "", 2)}`)

        let req = {
            method: operation.verb.toLowerCase(),
            cache: 'no-cache',
            mode: 'cors',
            redirect: 'manual'
        }


        // if the route is not a get and it has something in the body add it to the reqest
        if (!operation.verb.match(/get/i) ) {
        	if(operation.parameters.body.length > 0){
            	req.body = JSON.stringify(bodyParams)
                req.headers = {'Content-Type': operation.consumes || 'application/json'}
            }
            else if(operation.parameters.formData.length >0){
            	req.body = formData;
            }
        }

      //  console.log(`request object is ${JSON.stringify(req, "", 2)}`)
        clone.result = {message: "loading ... "}
        clone.loading = true;
        setState(clone)
        setFetchParams({ path: path, req: req })
    }

    function _fetch() {
        if (!fetchParams)
            return;
        let { path, req } = fetchParams;
        setFetchParams(undefined)

        
        const clone = { ...state }
        fetch(path, req).then((response) => {
            const data ={}
            data.headers = {}
            for (let [key, value] of response.headers) {
              data.headers[key] = value;
            }

            const promise = new Promise(function(resolve, reject){
                 response.json().then((result)=>{
                    data.body = result;
                    resolve(data)
                 }).catch((error)=>{
                    if(response.type=='opaqueredirect')
                    {
                        reject({opaqueredirect: "Cannot see redirect because of CORS"})
                    }else{
                        reject({error: error});
                    }
                    
                 })
            })

            return promise;
        }).then((data) => {
            clone.result = data;
            clone.loading = false;
            setState(clone);
        }).catch((err) => {
         //   console.log("failed fetch " + JSON.stringify(err))
            clone.result = err
            clone.loading = false;
            setState(clone);
        })
    }

    useEffect(() => {
        if (fetchParams) {
            _fetch()
        }
    });
   // console.log("called useRemoteApi")
    return { result: state.result, loading: state.loading, fetchData }
}

function processBodyParams(schema) {
  //  console.log("processing body params")
    let toReturn = []

    let type = schema.type;
    if (type != "object") {
       // console.log("unknown schema type " + type + " need to expand capabilities mario");
        return toReturn;
    }
    for(const property in schema.properties){

        toReturn.push({
            name: property,
            type: schema.properties[property].type,
            enum: schema.properties[property].enum,
            format: schema.properties[property].format,
            required: schema.properties[property].required
        })

    }

    return toReturn
}