function addSubCatagories() {
    event.preventDefault();
  
      let select = document.querySelector("#subCatagory")
      var new_input="<input type='text' id='subCatagory' name='subCatagory'class='form-control mb-2' placeholder='Sub-Category Name'>";
      $('#addSubCatagory').append(new_input);      
  }

  function removeSubCatagories() {
    event.preventDefault();
  
      let select = document.getElementById("addSubCatagory")
      select.removeChild(select.lastChild);      
  }