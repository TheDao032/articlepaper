//sửa lại theo profile

(function ($) {
    'use strict';
   
    try {
        $('.js-datepicker').daterangepicker({
            "singleDatePicker": true,
            "showDropdowns": true,
            "autoUpdateInput": false,
            locale: {
                format: 'DD/MM/YYYY'
            },
        });
    
        var myCalendar = $('.js-datepicker');
        var isClick = 0;
    
        $(window).on('click',function(){
            isClick = 0;
        });
    
        $(myCalendar).on('apply.daterangepicker',function(ev, picker){
            isClick = 0;
            $(this).val(picker.startDate.format('DD/MM/YYYY'));
    
        });
    
        $('.js-btn-calendar').on('click',function(e){
            e.stopPropagation();
    
            if(isClick === 1) isClick = 0;
            else if(isClick === 0) isClick = 1;
    
            if (isClick === 1) {
                myCalendar.focus();
            }
        });
    
        $(myCalendar).on('click',function(e){
            e.stopPropagation();
            isClick = 1;
        });
    
        $('.daterangepicker').on('click',function(e){
            e.stopPropagation();
        });    

        
        function validatePhone(){
            var phone = $('#phone').val();
            var vnf_regex = /((09|03|07|08|05)+([0-9]{8})\b)/g;
            if(phone !== ''){
                if (vnf_regex.test(phone) == false) 
                { 
                    $('.js-message-phone').val('Số điện thoại không đúng định dạng')
                    $('.js-message-phone').prop('type', 'text');
                    return false

                }
                else{
                    $('.js-message-phone').prop('type', 'hidden');
                    return true
                }
            }
            else{
                $('.js-message-phone').prop('type', 'hidden');
               return false
            }
        }

        $('#phone').on('blur',function(){
            validatePhone()
        });

        $('#phone').on('click',function(){
            $('.js-message-phone').prop('type', 'hidden');
          });

       

        function validateEmail(){
            var email = $('#email').val();
            var vnf_regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            if(email !== ''){
                if (vnf_regex.test(email) === false) 
                { 
                    $('.js-message-email').val('Email không đúng định dạng')
                    $('.js-message-email').prop('type', 'text');
                    return false

                }
                else{
                    $('.js-message-email').prop('type', 'hidden');
                    return true
                }
            }
            else{
                $('.js-message-email').prop('type', 'hidden');
               return false
            }
        }

        $('#email').on('blur',function(){
            validateEmail()
        });  

        $('#email').on('click',function(){
            $('.js-message-email').prop('type', 'hidden');
          });

        function validateFullname(){
            var fullname = $('#fullname').val();
            if (fullname !== '')
            {
                $('.js-message-fullname').prop('type', 'hidden');
                return true
            }
            else
            {
                // $('.js-message-fullname').val('Hãy nhập họ tên')
                // $('.js-message-fullname').prop('type', 'text');
                return false    
            }
        }

        function validateDOB(){
            var dob = $('#DOB').val();
            var vnf_regex = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/
            if(dob !== ''){
                if (vnf_regex.test(dob) === false) 
                { 
                    $('.js-message-DOB').val('Ngày sinh không đúng định dạng')
                    $('.js-message-DOB').prop('type', 'text');
                    return false
                }
                else{
                    var date = new Date(dob.split("/").reverse().join("-"))
                    var curDate = new Date()
                    if (date.getFullYear() >= 1900 && curDate.getFullYear() - date.getFullYear() >= 7)
                    {
                        $('.js-message-DOB').prop('type', 'hidden');
                        return true
                    }
                    else
                    {
                        $('.js-message-DOB').val('Bạn còn quá nhỏ')
                        $('.js-message-DOB').prop('type', 'text');
                        return false
                    }
                }
            }
            else{
                $('.js-message-DOB').prop('type', 'hidden');
               return false
            }

            //=============
            // var dob = $('#DOB').val();
            // if (dob !== '')
            // {
            //     $('.js-message-DOB').prop('type', 'hidden');
            //     return true
            // }
            // else
            // {
            //     $('.js-message-DOB').val('Hãy chọn ngày sinh')
            //     $('.js-message-DOB').prop('type', 'text');
            //     return false  
            // }
        }

        $('#DOB').on('blur',function(){
            validateDOB()
        });
        
        $('#DOB').on('click',function(){
            $('.js-message-DOB').prop('type', 'hidden');
          });

          function validatePseudonym(){
            var fullname = $('#pseudonym').val();
            if (fullname !== '')
            {
                $('.js-message-pseudonym').prop('type', 'hidden');
                return true
            }
            else
            {
                // $('.js-message-fullname').val('Hãy nhập họ tên')
                // $('.js-message-fullname').prop('type', 'text');
                return false    
            }
        }

        $('#pseudonym').on('click',function(){
            $('.js-message-pseudonym').prop('type', 'hidden');
          });

        $('#frmProfile').on('submit',function(e){
            if (validateFullname() === false)
            {
                $('#fullname').focus()
            }
            else if (validatePseudonym() === false)
            {
                $('#pseudonym').focus()
            }
            else if (validateEmail() === false)
            {
                $('#email').focus()
            }
            else if (validateDOB() === false)
            {
                $('#DOB').focus()
            }
            else if (validatePhone() === false)
            {
                $('#phone').focus()
            }
            else 
            {
                alert("Cập nhật thành công")
                return true
            }

            e.preventDefault()
            alert("Vui lòng điền thông tin đầy đủ và hợp lệ")
            return false      

            // if (validateUsername() && validatePassword() && validateConfirmPassword() && validateEmail() 
            //     && validateFullname() && validateDOB() && validatePhone())
            // {
            //     alert("vô key")
            //     $('#frmRegister').off('submit').submit() 
            //     return true   
            // }
            // else{
            //     e.preventDefault()
            //     alert("Vui lòng điền thông tin đầy đủ và hợp lệ")
            //     return false      
            // }
               
        })

        
        // $('#frmRegister').on('submit',function(e){
        //     e.preventDefault()
        //     if (validateConfirmPassword() && validatePhone() && validateUsername() && validateEmail())
        //     {
        //         $('#frmRegister').off('submit').submit()
        //     }
        //     else
        //     {
        //         alert("Hãy nhập đủ thông tin")
        //     }
        // });
        
    } catch(er) {console.log(er);}

    
    try {
        var selectSimple = $('.js-select-simple');
        selectSimple.each(function () {
            var that = $(this);
            var selectBox = that.find('select');
            var selectDropdown = that.find('.select-dropdown');
            selectBox.select2({
                dropdownParent: selectDropdown
            });
        });
    
    } catch (err) {
        console.log(err);
    }

})(jQuery);