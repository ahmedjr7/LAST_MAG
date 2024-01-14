
(function ($) {

  "use strict";

  // NAVBAR
  $('.navbar-nav .nav-link').click(function () {
    $(".navbar-collapse").collapse('hide');
  });

  // REVIEWS CAROUSEL
  $('.reviews-carousel').owlCarousel({
    center: true,
    loop: true,
    nav: true,
    dots: false,
    autoplay: true,
    autoplaySpeed: 300,
    smartSpeed: 500,
    responsive: {
      0: {
        items: 1,
      },
      768: {
        items: 2,
        margin: 100,
      },
      1280: {
        items: 2,
        margin: 100,
      }
    }
  });

  // Banner Carousel
  var myCarousel = document.querySelector('#myCarousel')
  var carousel = new bootstrap.Carousel(myCarousel, {
    interval: 1500,
  })

  // REVIEWS NAVIGATION
  function ReviewsNavResize() {
    $(".navbar").scrollspy({ offset: -94 });

    var ReviewsOwlItem = $('.reviews-carousel .owl-item').width();

    $('.reviews-carousel .owl-nav').css({ 'width': (ReviewsOwlItem) + 'px' });
  }

  $(window).on("resize", ReviewsNavResize);
  $(document).on("ready", ReviewsNavResize);

  // HREF LINKS
  $('a[href*="#"]').click(function (event) {
    if (
      location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        event.preventDefault();
        $('html, body').animate({
          scrollTop: target.offset().top - 74
        }, 1000);
      }
    }
  });

  document.getElementById('myForm').addEventListener('submit', function (event) {
    // Prevent the default form submission behavior
    event.preventDefault();
    debugger
    // Retrieve the values from the form fields
    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;
    const weight = document.getElementById('weight').value;
    const height = document.getElementById('height').value;
    const activityLevel = document.getElementById('activityLevel').value;
    const healthGoals = document.getElementById('healthGoals').value;
    const foodPreferences = document.getElementById('foodPreferences').value;
    const medicalHistory = document.getElementById('medicalHistory').value;
    //setData(age, gender, weight, height, activityLevel, healthGoals, foodPreferences, medicalHistory);

    chatGPT(age, gender, weight, height, activityLevel, healthGoals, foodPreferences, medicalHistory);
    // You can also send the data to a server using fetch or another method here
  });
  async function chatGPT(age, gender, weight, height, activityLevel, healthGoals, foodPreferences, medicalHistory) {
    // Show the loader
    const url = 'https://api.openai.com/v1/chat/completions';
    const loader = document.getElementById('loader');
    loader.style.display = 'flex';
    // Log the values (you can perform further actions here)
    console.log('age:', age);
    console.log('gender:', gender);
    console.log('weight:', weight);
    console.log('height:', height);
    console.log('activityLevel:', activityLevel);
    console.log('healthGoals:', healthGoals);
    console.log('foodPreferences:', foodPreferences);
    console.log('medicalHistory:', medicalHistory);
    let oldUserData = await getData();
    let oldUserDataString = '';
    if (oldUserData.length > 0) {
      oldUserData.forEach(userData => {
        oldUserDataString += `Date: ${userData.date}\n
        Age: ${userData.age}\n
        Gender: ${userData.gender}\n
        Weight: ${userData.weight}\n
        Height: ${userData.height}\n
        Activity level: ${userData.activityLevel}\n
        Health goals: ${userData.healthGoals}\n
        Food preferences: ${userData.foodPreferences}\n
        Medical history: ${userData.medicalHistory}\n`;
      });
    }
    const data = {
      "model": "gpt-3.5-turbo",
      "messages": [{
        "role": "user",
        "content": `* Act Like Personalized Health and Nutrition Recommendations and respond with a list of recommendations, use the following data as a reference for the patient current info:\n
                    Age and Gender: As a ${age}-year-old ${gender}, focus on nutrients important for your age and gender, such as calcium and possibly iron.\n
                    , Weight and Height: With a weight of ${weight} kg and height of ${height} cm, maintaining a balanced diet and regular exercise is key to achieving a healthy BMI.\n
                    , Activity Level: Your current activity level is '${activityLevel}'. Aim to incorporate both aerobic and strength-training exercises into your routine for optimal health.\n
                    , Health Goals: To achieve your goals of ${healthGoals}, consider a diet rich in ${healthGoals == 'weight loss' ? '' : 'whole grains, lean proteins, and a variety of fruits and vegetables'}.\n
                    , Food Preferences: Given your preference for ${foodPreferences}, include these in your meals in a balanced way. Consider exploring healthy recipes that align with these preferences.\n
                    , Medical History: Taking into account your medical history of ${medicalHistory}, it's important to tailor your diet and exercise to manage or mitigate these conditions. Consult with healthcare professionals for personalized advice.\n
                    * Consider the old user info bellow with your recomndation: \n
                    ${oldUserDataString}`
      }
      ]
    };
    console.log("THIS IS THE DATA THAT WE ARE TRYING TO SEND TO CHAT GPT API:", data);
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer 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',
      'organization': 'org-FBOl6Ubqy7gVRcVmkYz4FX1A'
    };
    fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Success:', data?.choices?.message?.content);
        // Your description text
        const descriptionText = data?.choices[0]?.message?.content;
        // Get the container element in the HTML where you want to display the description
        const descriptionContainer = document.getElementById('descriptionContainer');
        // Set the text content of the container to the description text
        descriptionContainer.textContent = descriptionText;
        localStorage.setItem('previousRecommendation', JSON.stringify(descriptionText));
        location.reload();
      })
      .catch(error => {
        console.error('Error:', error);
      }).finally(() => {
        // Hide the loader after the request is complete (successful or failed)
        loader.style.display = 'none';
        setData(age, gender, weight, height, activityLevel, healthGoals, foodPreferences, medicalHistory);
      });
  }
  function setData(age, gender, weight, height, activityLevel, healthGoals, foodPreferences, medicalHistory) {
    let oldData = [];
    oldData = getData();
    let newData = { date: new Date(), age, gender, weight, height, activityLevel, healthGoals, foodPreferences, medicalHistory };
    oldData.unshift(newData);
    localStorage.setItem('userData', JSON.stringify(oldData));
  }
  function getData() {
    debugger
    const storedData = JSON.parse(localStorage.getItem('userData'));
    if (storedData) {
      return storedData;
    } else {
      return [];
    }
  }
  renderPre();
  async function renderPre() {
    debugger
    let oldUserData = await getData();
    if (oldUserData.length > 0) {
      loader.style.display = 'flex';
      const previousRecommendation = await JSON.parse(localStorage.getItem('previousRecommendation'));
      const descriptionContainer = document.getElementById('descriptionContainer');
      if (previousRecommendation) {
        descriptionContainer.textContent = previousRecommendation;
      } else {
        descriptionContainer.textContent = 'No previous recommendation';
      }
      var div = document.getElementById('previousUserInformation');
      div.style.display = 'flex';
      // Create an unordered list element
      var ul = document.createElement('ul');
      var li = document.createElement('li');
      li.textContent = 'Date: ' + oldUserData[0].date;
      ul.appendChild(li);
      var li = document.createElement('li');
      li.textContent = 'Age: ' + oldUserData[0].age;
      ul.appendChild(li);
      var li = document.createElement('li');
      li.textContent = 'Gender: ' + oldUserData[0].gender;
      ul.appendChild(li);
      var li = document.createElement('li');
      li.textContent = 'Weight: ' + oldUserData[0].weight;
      ul.appendChild(li);
      var li = document.createElement('li');
      li.textContent = 'Height: ' + oldUserData[0].height;
      ul.appendChild(li);
      var li = document.createElement('li');
      li.textContent = 'Activity level: ' + oldUserData[0].activityLevel;
      ul.appendChild(li);
      var li = document.createElement('li');
      li.textContent = 'Health goals: ' + oldUserData[0].healthGoals;
      ul.appendChild(li);
      var li = document.createElement('li');
      li.textContent = 'Food preferences: ' + oldUserData[0].foodPreferences;
      ul.appendChild(li);
      var li = document.createElement('li');
      li.textContent = 'Medical history: ' + oldUserData[0].medicalHistory;
      ul.appendChild(li);
      div.appendChild(ul);
      loader.style.display = 'none';
    }
  }
  // Get the button element
  const myButton = document.getElementById('reset-button');

  // Add a click event listener to the button
  myButton.addEventListener('click', handleResetPress);

  // Function to be executed when the button is pressed
  async function handleResetPress(event) {
    event.preventDefault();
    await localStorage.clear()
    alert('Storage cleand!');
    location.reload();
  }

})(window.jQuery);
