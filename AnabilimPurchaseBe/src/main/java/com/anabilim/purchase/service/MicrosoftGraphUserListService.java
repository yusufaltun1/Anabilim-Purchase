package com.anabilim.purchase.service;

import com.anabilim.purchase.repository.UserRepository;
import com.microsoft.graph.models.User;
import com.microsoft.graph.models.UserCollectionResponse;
import com.microsoft.graph.serviceclient.GraphServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class MicrosoftGraphUserListService {

    private final GraphServiceClient graphServiceClient;
    private final UserRepository userRepository;

    /**
     * Microsoft Graph /users endpoint'inden kullanıcıları çeker ve loglar.
     */
    @Transactional
    public void fetchAndLogUsers() {
        try {
            UserCollectionResponse response = graphServiceClient.users().get(requestConfiguration -> {
                requestConfiguration.queryParameters.select =
                        new String[]{
                                "id",
                                "displayName",
                                "givenName",
                                "surname",
                                "mail",
                                "userPrincipalName",
                                "mobilePhone",
                                "businessPhones",
                                "jobTitle",
                                "officeLocation",
                                "preferredLanguage",
                                "accountEnabled"
                        };
            });

            int page = 1;
            int totalUsers = 0;
            int createdUsers = 0;
            int updatedUsers = 0;

            while (response != null) {
                List<User> users = response.getValue();
                if (users != null) {
                    for (User user : users) {
                        totalUsers++;
                        String effectiveEmail = resolveEffectiveEmail(user);
                        if (effectiveEmail == null) {
                            log.warn("Graph user skipped (no mail/userPrincipalName): id={}, displayName={}",
                                    user.getId(), user.getDisplayName());
                            continue;
                        }

                        boolean isCreated = upsertLocalUser(user, effectiveEmail);
                        if (isCreated) {
                            createdUsers++;
                        } else {
                            updatedUsers++;
                        }

                        log.info(
                                "Graph user [{}]: id={}, displayName={}, givenName={}, surname={}, mail={}, userPrincipalName={}, mobilePhone={}, businessPhones={}, jobTitle={}, officeLocation={}, preferredLanguage={}, accountEnabled={}",
                                totalUsers,
                                user.getId(),
                                user.getDisplayName(),
                                user.getGivenName(),
                                user.getSurname(),
                                user.getMail(),
                                user.getUserPrincipalName(),
                                user.getMobilePhone(),
                                user.getBusinessPhones(),
                                user.getJobTitle(),
                                user.getOfficeLocation(),
                                user.getPreferredLanguage(),
                                user.getAccountEnabled()
                        );
                    }
                }

                String nextLink = response.getOdataNextLink();
                if (nextLink == null || nextLink.isBlank()) {
                    break;
                }

                page++;
                log.info("Microsoft Graph user list paging -> page {} (nextLink present)", page);
                response = graphServiceClient.users().withUrl(nextLink).get();
            }

            log.info("Microsoft Graph user sync completed. totalUsers={}, createdUsers={}, updatedUsers={}",
                    totalUsers, createdUsers, updatedUsers);
        } catch (Exception e) {
            // Uygulama kalkışını düşürmeyelim; sadece loglayalım.
            log.warn("Microsoft Graph user list fetch failed: {}", e.getMessage(), e);
        }
    }

    private String resolveEffectiveEmail(User graphUser) {
        if (graphUser.getMail() != null && !graphUser.getMail().isBlank()) {
            return graphUser.getMail().trim().toLowerCase();
        }
        if (graphUser.getUserPrincipalName() != null && !graphUser.getUserPrincipalName().isBlank()) {
            return graphUser.getUserPrincipalName().trim().toLowerCase();
        }
        return null;
    }

    private boolean upsertLocalUser(User graphUser, String effectiveEmail) {
        Optional<com.anabilim.purchase.entity.User> existingByMsId =
                graphUser.getId() != null && !graphUser.getId().isBlank()
                        ? userRepository.findByMicrosoft365Id(graphUser.getId())
                        : Optional.empty();

        Optional<com.anabilim.purchase.entity.User> existingByEmail = userRepository.findByEmail(effectiveEmail);

        com.anabilim.purchase.entity.User localUser = existingByMsId
                .or(() -> existingByEmail)
                .orElseGet(com.anabilim.purchase.entity.User::new);

        boolean isNew = localUser.getId() == null;

        localUser.setEmail(effectiveEmail);
        localUser.setMicrosoft365Id(graphUser.getId());
        localUser.setMicrosoftId(graphUser.getId());

        String givenName = graphUser.getGivenName();
        String surname = graphUser.getSurname();
        String displayName = graphUser.getDisplayName();

        if (givenName == null || givenName.isBlank()) {
            givenName = displayName != null && !displayName.isBlank() ? displayName : effectiveEmail;
        }
        if (surname == null) {
            surname = "";
        }

        localUser.setFirstName(givenName);
        localUser.setLastName(surname);
        localUser.setDisplayName(displayName != null && !displayName.isBlank() ? displayName : givenName);
        localUser.setFullName(localUser.getDisplayName());
        localUser.setPosition(graphUser.getJobTitle());

        String phone = graphUser.getMobilePhone();
        if ((phone == null || phone.isBlank()) && graphUser.getBusinessPhones() != null && !graphUser.getBusinessPhones().isEmpty()) {
            phone = graphUser.getBusinessPhones().get(0);
        }
        localUser.setPhone(phone);

        if (localUser.getDepartment() == null || localUser.getDepartment().isBlank()) {
            localUser.setDepartment(graphUser.getOfficeLocation() != null ? graphUser.getOfficeLocation() : "Unknown");
        }
        if (localUser.getPosition() == null || localUser.getPosition().isBlank()) {
            localUser.setPosition("Unknown");
        }

        localUser.setIsActive(graphUser.getAccountEnabled() == null || graphUser.getAccountEnabled());

        userRepository.save(localUser);
        return isNew;
    }
}
