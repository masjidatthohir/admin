
    var firebaseConfig = {
        apiKey: "AIzaSyB6qerNsyshgEjQlpTn5QOW_tCfpah7fIo",
        authDomain: "itikaf-63482.firebaseapp.com",
        databaseURL: "https://itikaf-63482-default-rtdb.firebaseio.com",
        projectId: "itikaf-63482",
        storageBucket: "itikaf-63482.appspot.com",
        messagingSenderId: "452451341170"
    };
    firebase.initializeApp(firebaseConfig);
    var database = firebase.database();
    
    // Function to add kegiatan row to the table
    function addKegiatanRow(kegiatanId, kegiatan, imageUrl) {
      var tableBody = document.querySelector('table tbody');
      var row = '<tr id="' + kegiatanId + '">' +
        '<td><img src="' + imageUrl + '" alt="Customer Image" style="max-width: 100px;"></td>' +
        '<td>' + kegiatan.nama + '</td>' +
        '<td>' + kegiatan.tanggal + '</td>' +
        '<td>' + kegiatan.waktu + '</td>' +
        '<td>' + kegiatan.tempat + '</td>' +
        '<td>' + kegiatan.deskripsi + '</td>' +
        '<td>' +
        '<a href="#" class="edit" onclick="showKegiatanModal(\'' + kegiatanId + '\')"><i class="material-icons">&#xE254;</i></a>' +
        '<a href="#" class="delete" onclick="deleteFunction(\'' + kegiatanId + '\')"><i class="material-icons">&#xE872;</i></a>' +
        '</td>' +
        '</tr>';
      tableBody.insertAdjacentHTML('afterbegin', row); // Add new rows at the beginning
    }

    // Function to update kegiatan row in the table
    function updateKegiatanRow(kegiatanId, kegiatan, imageUrl) {
      var row = document.getElementById(kegiatanId);
      if (row) {
        row.innerHTML = '<td><img src="' + imageUrl + '" alt="Customer Image" style="max-width: 100px;"></td>' +
          '<td>' + kegiatan.nama + '</td>' +
          '<td>' + kegiatan.tanggal + '</td>' +
          '<td>' + kegiatan.waktu + '</td>' +
          '<td>' + kegiatan.tempat + '</td>' +
          '<td>' + kegiatan.deskripsi + '</td>' +
          '<td>' +
          '<a href="#" class="edit" onclick="showKegiatanModal(\'' + kegiatanId + '\')"><i class="material-icons">&#xE254;</i></a>' +
          '<a href="#" class="delete" onclick="deleteFunction(\'' + kegiatanId + '\')"><i class="material-icons">&#xE872;</i></a>' +
          '</td>';
      }
    }

    // Function to read kegiatan from the database and listen for new or updated entries
    function readKegiatan() {
      database.ref('kegiatan').on('child_added', function (snapshot) {
        var kegiatan = snapshot.val();
        var kegiatanId = snapshot.key;
    
        // Get the image URL from Firebase Storage
        firebase.storage().ref("kegiatan").child(kegiatanId + "/image.png").getDownloadURL().then(function (imageUrl) {
          addKegiatanRow(kegiatanId, kegiatan, imageUrl);
        }).catch(function(error) {
          console.log("Error getting image URL:", error);
        });
      });
      
      database.ref('kegiatan').on('child_changed', function (snapshot) {
        var kegiatan = snapshot.val();
        var kegiatanId = snapshot.key;
    
        // Get the image URL from Firebase Storage
        firebase.storage().ref("kegiatan").child(kegiatanId + "/image.png").getDownloadURL().then(function (imageUrl) {
          updateKegiatanRow(kegiatanId, kegiatan, imageUrl);
        }).catch(function(error) {
          console.log("Error getting image URL:", error);
        });
      });
    }
    
    function deleteFunction(kegiatan_id) {
      var isConfirmed = confirm('Are you sure you want to delete?');
      if (isConfirmed) {
        database.ref('kegiatan/' + kegiatan_id).remove();
        document.getElementById(kegiatan_id).remove(); // Remove the row from the table
      }
    }
    
    function showKegiatanModal(kegiatanId) {
      var kegiatanRef = database.ref('kegiatan/' + kegiatanId);
      kegiatanRef.once('value').then(function(snapshot) {
        var kegiatan = snapshot.val();
        document.getElementById('modal-kegiatan_id').value = kegiatanId;
        document.getElementById('modal-nama_kegiatan').value = kegiatan.nama;
        document.getElementById('modal-tanggal_kegiatan').value = kegiatan.tanggal;
        document.getElementById('modal-waktu_kegiatan').value = kegiatan.waktu;
        document.getElementById('modal-tempat_kegiatan').value = kegiatan.tempat;
        document.getElementById('modal-deskripsi').value = kegiatan.deskripsi;
        $('#kegiatanModal').modal('show'); // Show the modal
      });
    }
    
    function submitFunction() {
      var kegiatanId = document.getElementById('modal-kegiatan_id').value;
      var nama = document.getElementById('modal-nama_kegiatan').value;
      var tanggal = document.getElementById('modal-tanggal_kegiatan').value;
      var waktu = document.getElementById('modal-waktu_kegiatan').value;
      var tempat = document.getElementById('modal-tempat_kegiatan').value;
      var deskripsi = document.getElementById('modal-deskripsi').value;
      var imageFile = document.getElementById('modal-image').files[0];
    
      // Check if the form is valid
      var form = document.getElementById('model-form');
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
    
      if (kegiatanId !== '') {
        var kegiatanRef = database.ref('kegiatan/' + kegiatanId);
        kegiatanRef.update({
          nama: nama,
          tanggal: tanggal,
          waktu: waktu,
          tempat: tempat,
          deskripsi: deskripsi
        }).then(function() {
          if (imageFile) {
            firebase.storage().ref("kegiatan").child(kegiatanId + "/image.png").put(imageFile).then(function() {
              $('#kegiatanModal').modal('hide'); // Hide the modal after update          
              form.reset(); // Reset the form data after submission
            });
          } else {
            $('#kegiatanModal').modal('hide'); // Hide the modal after update          
            form.reset(); // Reset the form data after submission
          }
        });
      } else {
        var newKegiatanRef = database.ref('kegiatan').push();
        var kegiatanKey = newKegiatanRef.key;
        newKegiatanRef.set({
          nama: nama,
          tanggal: tanggal,
          waktu: waktu,
          tempat: tempat,
          deskripsi: deskripsi
        }).then(function() {
          if (imageFile) {
            firebase.storage().ref("kegiatan").child(kegiatanKey + "/image.png").put(imageFile).then(function() {
              $('#kegiatanModal').modal('hide'); // Hide the modal after update          
              form.reset(); // Reset the form data after submission
            });
          } else {
            $('#kegiatanModal').modal('hide'); // Hide the modal after update          
            form.reset(); // Reset the form data after submission
          }
        });
      }
    }
    
    readKegiatan();
