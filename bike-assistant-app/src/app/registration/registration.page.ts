import { Component, OnInit } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
})
export class RegistrationPage implements OnInit {
  name = '';
  email = '';
  password = '';

  constructor(private http: HTTP) {
  }
  ngOnInit() {
  }
  async onSubmit() {
      const postData = {
          'username': this.name,
          'email': this.email,
          'password': this.password
      };

   // this.http.get('https://my-json-server.typicode.com/typicode/demo/profile', {}, {'Content-Type': 'application/json'})
   //        .then(data => {
   //
   //            console.log(data);
   //            console.log(data.data); // data received by server
   //            console.log(data.headers);
   //
   //        })
   //        .catch(error => {
   //              console.log('ERROR');
   //            console.log(error.status);
   //            console.log(error.error); // error message as string
   //            console.log(error.headers);
   //
   //        });
      this.http.post('http://localhost:5000/api/register', postData, {'Content-Type': 'application/json'})
       .then(data => {

              console.log(data);

       })
       .catch(error => {

              console.log(error.status);
              console.log(error.error); // error message as string
              console.log(error.headers);

       });

  }

}
