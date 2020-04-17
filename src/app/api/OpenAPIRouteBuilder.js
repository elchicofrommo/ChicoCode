import React, { useState, useEffect } from 'react';

export function generateRoutes(source) {
    const paths = source.paths;

    let routes = {};
    //console.log(`api routes is ` + ApiRoutes)

    for (const path in paths) {
        for (const verb in paths[path]) {
            const { tags, summary, parameters, produces } = paths[path][verb]
            console.log(`${path} ${verb} ${tags} ${summary} ${parameters} ${produces}`)
            if (!routes[tags])
                routes[tags] = {}
            if (!routes[tags][path])
                routes[tags][path] = {}

            const host = source.host || "";
            const base = source.basePath || "";

            // pull out the api route function 
            let opString = paths[path][verb].operationId;
            opString = opString.charAt(0).toUpperCase() + opString.slice(1)
            const operation = {
                path: host + base + path,
                verb: verb,
                parameters: {
                    path: [],
                    body: [],
                    query: [],
                    formData: []
                }
            }

            if (paths[path][verb].consumes) {
                operation.consumes = paths[path][verb].consumes
            }

            if (parameters) {
                parameters.forEach((entry) => {
                    if (entry.in == "path") {

                        operation.parameters.path.push({ name: entry.name, description: entry.description, type: entry.type })
                    } else if (entry.in == "query") {
                        operation.parameters.query.push({ name: entry.name, description: entry.description, type: entry.type })
                    } else if (entry.in == "body") {
                        let processedBody = processBodyParams(entry.content);
                        operation.parameters.body = operation.parameters.body.concat(processedBody)
                    } else if (entry.in == "formData") {
                        operation.parameters.formData.push({ name: entry.name, description: entry.description, type: entry.type })
                    }
                })
            }

            operation.useHook = () => {
                return useRemoteApi(operation)
            }

            console.log(`operation is ${JSON.stringify(operation, "", 2)}`)
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
        result: "ready ...",
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
            console.log("trying to fetch ontop of an fetch that is already running")
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
            clone.result = "The following errors occured: " + JSON.stringify(error);
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

        console.log(`constructed full path ${path} with body ${JSON.stringify(bodyParams, "", 2)} and formData ${JSON.stringify(formData, "", 2)}`)

        let req = {
            method: operation.verb.toLowerCase(),
            cache: 'no-cache',
            mode: 'cors'
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

        console.log(`request object is ${JSON.stringify(req, "", 2)}`)
        clone.result = "loading ... "
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
            console.log("successful fetch " + JSON.stringify(response))
            return response.json()
        }).then((data) => {
            clone.result = data;
            clone.loading = false;
            setState(clone);
        }).catch((err) => {
            console.log("failed fetch " + JSON.stringify(err))
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
    console.log("called useRemoteApi")
    return { result: state.result, loading: state.loading, fetchData }
}

function processBodyParams(content) {
    console.log("processing body params")
    let toReturn = []
    let formType = content['application/x-www-form-urlencoded']
    if (!formType) {
        console.log(`unnown form type, need to expand capabilities mario `)
        return toReturn;
    }
    let type = formType.schema.type;
    if (type != "object") {
        console.log("unknown schema type " + type + " need to expand capabilities mario");
        return toReturn;
    }
    formType.schema.properties.forEach((property) => {

        for (const entry in property) {
            toReturn.push({
                name: entry,
                type: property[entry].type
            })
        }
    })

    return toReturn
}