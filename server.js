import http from 'http'
import {readFileSync, writeFileSync} from 'fs'
import dotenv from 'dotenv'
import { findIndexId } from './utility/function.js'

//env manage
dotenv.config()

const port = process.env.SERVER_PORT

// data mange at json

const student_json= readFileSync('./data/students.json')
const student_obj = JSON.parse(student_json)


//server create 

http.createServer( (req, res)=>{


    //routing condition 

    if(req.url == '/api/students' && req.method == "GET"){
        res.writeHead(200, {'Content-Type' : 'application/json'})
        res.end(student_json)
    }else if(req.url.match(/\/api\/students\/[0-9]{1,}/) && req.method == "GET") {   
        
        let id = req.url.split('/')[3]
        if(student_obj.some( stu=> stu.id==id)){
            res.writeHead(200, {'Content-Type':'application/json'})
            res.end(JSON.stringify(student_obj.find( stu=> stu.id ==id)))
        }else{
            res.writeHead(200, {'Content-Type':'application/json'})
            res.end(JSON.stringify({
                message: 'Id no availble'
            }))
        }
        
        
    }else if(req.url == '/api/students' && req.method == "POST"){

        //req data
        let data = ''

        req.on('data', (chunk)=>{
            data += chunk.toString()
        })
        req.on('end', ()=>{
            let {name, age, skill, location} = JSON.parse(data)
            student_obj.push({
                id: findIndexId(student_obj),
                name:name,
                age:age,
                skill:skill,
                location:location
            })
            writeFileSync('./data/students.json', JSON.stringify(student_obj))
        })


         res.writeHead(200, {'Content-Type':'application/json'})
         res.write(JSON.stringify({
            message : "Data post okay"
        }))
        res.end()

    } else if (req.url.match(/\/api\/students\/[0-9]{1,}/) && req.method == "DELETE") {
        let id = req.url.split('/')[3]
        
        let delete_data = student_obj.filter(stu=> stu.id !=id) 

        writeFileSync('./data/students.json', JSON.stringify(delete_data))
        
        res.writeHead(200, {'Content-Type':'application/json'})
        res.end({message: "Data Deleted"})

    } else if (req.url.match(/\/api\/students\/[0-9]{1,}/) && req.method == "PUT" || req.url.match(/\/api\/students\/[0-9]{1,}/) && req.method == "PATCH") {
        
        let id = req.url.split('/')[3]

        if(student_obj.some(stu=> stu.id==id)){
            let data = ''
            req.on('data', (chunk) => {
                data += chunk.toString()
            })
            req.on('end', () => {
               
                let update_data = JSON.parse(data)
                
                student_obj[student_obj.findIndex(stu => stu.id == id)]={
                    id:id,
                    name: update_data.name,
                    skill: update_data.skill,
                    age: update_data.age,
                    location: update_data.location


                }
                writeFileSync('./data/students.json', JSON.stringify(student_obj))
            })
  

        }else{
            res.writeHead(200, {'Content-Type':'application/json'})
            res.end(JSON.stringify({
            message: "Data Not Found"
        }))
        }

        
        
    }else{
        res.writeHead(200, {'Content-Type':'application/json'})
        
        res.end(JSON.stringify({
            error: "Invalid Router"
        }))
    }

     
   
    

}).listen(port, () => {
    console.log(`server is running on ${port} port`);
})
