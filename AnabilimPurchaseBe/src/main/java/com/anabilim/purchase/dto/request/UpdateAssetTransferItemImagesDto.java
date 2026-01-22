package com.anabilim.purchase.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Asset transfer kalemi için transfer / teslim alma resimlerini güncelleme DTO'su
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAssetTransferItemImagesDto {

    /**
     * Transfer (yükleme) aşamasındaki resimler (base64 listesi)
     */
    private java.util.List<String> transferImagesBase64;

    /**
     * Teslim alma aşamasındaki resimler (base64 listesi)
     */
    private java.util.List<String> receiveImagesBase64;
}

