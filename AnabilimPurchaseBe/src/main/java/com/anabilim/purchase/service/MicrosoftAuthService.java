package com.anabilim.purchase.service;

import com.anabilim.purchase.dto.LoginResponse;
import com.anabilim.purchase.dto.request.MicrosoftCodeRequest;

public interface MicrosoftAuthService {
    
    /**
     * Microsoft access token ile kullanıcıyı doğrular ve JWT token üretir
     */
    LoginResponse verifyTokenAndGenerateJwt(MicrosoftCodeRequest request);
}
