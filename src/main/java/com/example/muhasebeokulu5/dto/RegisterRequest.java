package com.example.muhasebeokulu5.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    // Kullanıcı adı backend'de otomatik oluşturulacak (firstName + random numbers)
    // Frontend'den gelmeyecek

    @NotBlank(message = "Şifre boş olamaz")
    @Size(min = 8, max = 100, message = "Şifre en az 8 karakter olmalıdır")
    private String password;

    @NotBlank(message = "Şifre onayı boş olamaz")
    private String confirmPassword;

    // Rol backend'de otomatik USER olarak atanacak
    // ADMIN rolü sadece veritabanından manuel olarak atanabilir

    // Temel kişisel bilgiler
    @NotBlank(message = "Ad boş olamaz")
    @Size(min = 2, max = 50, message = "Ad 2-50 karakter arasında olmalıdır")
    private String firstName;

    @NotBlank(message = "Soyad boş olamaz")
    @Size(min = 2, max = 50, message = "Soyad 2-50 karakter arasında olmalıdır")
    private String lastName;

    @Email(message = "Geçerli bir e-posta adresi giriniz")
    @NotBlank(message = "E-posta boş olamaz")
    private String email;
}
