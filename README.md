Projet étudiant - 16 octobre 2022

# Lab - Frameworks coté Serveur

## Auteurs

| Nom | Prénom | login | email |
|--|--|--|--|
| Boireau | Mathieu | bm180551 | mathieu.boireau@etu.univ-lehavre.fr |
| Coufourier | Guillaume | cg180730 | guillaume.coufourier@etu.univ-lehavre.fr |

Import de la base de données :
```
> mongoimport --host localhost:27017 --db Annonces --collection annonces < db/json/annonces.json --jsonArray
> node db/setupUser.js
```
